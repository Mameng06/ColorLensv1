import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, TouchableWithoutFeedback, GestureResponderEvent, Platform, PermissionsAndroid } from 'react-native';
import { styles } from './ColorDetector.styles';
import { getRandomColor } from './ColorDetectorLogic';
// Optional TTS
let Tts: any = null;
try { Tts = require('react-native-tts'); } catch (e) { Tts = null; }

// Optional camera modules (lazy-require)
let RNCamera: any = null;
let VisionCamera: any = null;
try { RNCamera = require('react-native-camera').RNCamera; } catch (e) { RNCamera = null; }
try { VisionCamera = require('react-native-vision-camera'); } catch (e) { VisionCamera = null; }

interface ColorDetectorProps {
  onBack: () => void;
  openSettings: () => void;
  voiceEnabled?: boolean;
  colorCodesVisible?: boolean;
}

const ColorDetector: React.FC<ColorDetectorProps> = ({ onBack, openSettings, voiceEnabled=true, colorCodesVisible=true }) => {
  const [detected, setDetected] = useState<{family:string,hex:string,realName:string} | null>(null);
  const [running, setRunning] = useState(true);
  const [freeze, setFreeze] = useState(false);
  const [crosshairPos, setCrosshairPos] = useState<{x:number,y:number}|null>(null);
  const intervalRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const previewLayout = useRef<{x:number,y:number,width:number,height:number}>({ x:0,y:0,width:0,height:0 });
  const previewRef = useRef<any>(null);
  const cameraContainerRef = useRef<any>(null);
  const [previewSize, setPreviewSize] = useState<{width:number,height:number} | null>(null);
  const [cameraPermission, setCameraPermission] = useState<string | null>(null);
  // We'll discover devices explicitly using the VisionCamera APIs (getAvailableCameraDevices)
  const [availableDevices, setAvailableDevices] = useState<any[] | null>(null);
  const availableDevice = availableDevices ? availableDevices.find((d:any) => d.position === 'back') ?? availableDevices[0] : null;

  useEffect(() => {
    // Check Android permission using PermissionsAndroid for reliability
    const checkPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
          setCameraPermission(has ? 'authorized' : 'denied');
        } else if (VisionCamera) {
          // Fallback: try vision-camera API
          if (VisionCamera.getCameraPermissionStatus) {
            const status = await VisionCamera.getCameraPermissionStatus();
            setCameraPermission(status);
          } else if (VisionCamera.Camera && VisionCamera.Camera.getCameraPermissionStatus) {
            const status = await VisionCamera.Camera.getCameraPermissionStatus();
            setCameraPermission(status);
          } else {
            setCameraPermission(null);
          }
        }
      } catch (e) {
        console.log('permission check failed', e);
        setCameraPermission(null);
      }
    };
    checkPermission();

    startDetection();
    return () => stopDetection();
  }, []);

  // When permission becomes authorized, try to query available devices explicitly
  useEffect(() => {
    const discover = async () => {
      if (!VisionCamera) return;
      if (cameraPermission !== 'authorized') return;
      try {
        // Try the promise-based API
        if (VisionCamera.getAvailableCameraDevices) {
          const list = await VisionCamera.getAvailableCameraDevices();
          setAvailableDevices(list ?? null);
          console.log('VisionCamera.getAvailableCameraDevices ->', list);
          return;
        }
        // Some versions may require Camera.getAvailableCameraDevices
        if (VisionCamera.Camera && VisionCamera.Camera.getAvailableCameraDevices) {
          const list = await VisionCamera.Camera.getAvailableCameraDevices();
          setAvailableDevices(list ?? null);
          console.log('VisionCamera.Camera.getAvailableCameraDevices ->', list);
          return;
        }
      } catch (e) {
        console.log('discover devices failed', e);
      }
    };
    discover();
  }, [cameraPermission]);

  // Speak when a new color family is detected
  useEffect(() => {
    if (detected && voiceEnabled) {
      if (!Tts) {
        try { Tts = require('react-native-tts'); } catch (e) { Tts = null; }
      }
      if (Tts && Tts.speak) {
        try {
          // Best-effort init: set language and rate if available
          if (Tts.setDefaultLanguage) try { Tts.setDefaultLanguage('en-US'); } catch (e) { /* ignore */ }
          if (Tts.setDefaultRate) try { Tts.setDefaultRate(0.5); } catch (e) { /* ignore */ }
          Tts.stop();
          Tts.speak(detected.family);
        } catch (e) { console.log('TTS speak failed', e); }
      }
    }
  }, [detected?.family, voiceEnabled]);

  const startDetection = () => {
    stopDetection();
    intervalRef.current = setInterval(() => {
      if (!freeze) {
        const c = getRandomColor();
        setDetected(c);
      }
    }, 800);
    setRunning(true);
  };

  const stopDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  };

  const toggleFreeze = () => {
    const next = !freeze;
    setFreeze(next);
    if (!next) {
      // unfreezing -> reset crosshair to center
      setCrosshairPos(null);
    } else {
      // when freezing, set crosshair to center initially
      // center will be computed based on preview size; fallback to center of cameraArea via styles
      // measure the preview wrapper in window coordinates then set center
      setTimeout(() => {
        try {
          if (previewRef.current && previewRef.current.measureInWindow) {
            previewRef.current.measureInWindow((px: number, py: number, pw: number, ph: number) => {
              previewLayout.current = { x: px, y: py, width: pw, height: ph };
              setCrosshairPos({ x: pw / 2, y: ph / 2 });
            });
          }
        } catch (e) { setCrosshairPos(null); }
      }, 50);
    }
  };

  const onScreenPress = (e: any) => {
    // Only allow moving the crosshair when frame is frozen
    if (!freeze) return;

    // Use absolute page coordinates and measure preview position to compute relative point
    const pageX = e.nativeEvent.pageX as number;
    const pageY = e.nativeEvent.pageY as number;
    try {
      if (previewRef.current && previewRef.current.measureInWindow) {
        previewRef.current.measureInWindow((px: number, py: number, pw: number, ph: number) => {
          previewLayout.current = { x: px, y: py, width: pw, height: ph };
          const relX = Math.max(0, Math.min(pw, pageX - px));
          const relY = Math.max(0, Math.min(ph, pageY - py));
          setCrosshairPos({ x: relX, y: relY });
          // when frozen, tapping selects a new sampled color at that point
          const c = getRandomColor();
          setDetected(c);
        });
      }
    } catch (err) {
      console.log('measure failed', err);
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera Permission',
          message: 'ColorLens needs access to your camera to detect colors in real time.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        setCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED ? 'authorized' : 'denied');
        return;
      }
      if (!VisionCamera) return;
      if (VisionCamera.requestCameraPermission) {
        const res = await VisionCamera.requestCameraPermission();
        setCameraPermission(res);
      } else if (VisionCamera.Camera && VisionCamera.Camera.requestCameraPermission) {
        const res = await VisionCamera.Camera.requestCameraPermission();
        setCameraPermission(res);
      } else if (VisionCamera.requestPermissions) {
        const res = await VisionCamera.requestPermissions();
        setCameraPermission(res?.camera ?? 'denied');
      }
    } catch (e) {
      console.log('requestCameraPermission failed', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => { Alert.alert('Settings','Open settings (placeholder)'); openSettings(); }} style={styles.settingsButton}><Text style={styles.settingsText}>⚙️</Text></TouchableOpacity>
      </View>

      {/* Camera area (placeholder image) */}
      <TouchableWithoutFeedback onPress={onScreenPress}>
        <View style={styles.cameraArea}>
          {/* preview wrapper measured for crosshair coordinate mapping */}
          <View style={{ width: '100%', alignItems: 'center', position: 'relative' }}>
          {/* Prefer react-native-camera RNCamera if present */}
          {RNCamera ? (
            <View ref={cameraContainerRef} style={styles.cameraPreviewContainer} onLayout={(e)=>{
              try {
                const { width: pw, height: ph } = e.nativeEvent.layout;
                previewLayout.current.width = pw;
                previewLayout.current.height = ph;
                setPreviewSize({ width: pw, height: ph });
              } catch (err) { /* ignore */ }
            }}>
              <RNCamera
                style={styles.cameraInner}
                type={RNCamera.Constants.Type.back}
                captureAudio={false}
              />
            </View>
          ) : VisionCamera ? (
            // VisionCamera rendering: use the hook result computed at top-level (`device`)
            (() => {
              // Permission not authorized yet
              if (cameraPermission !== 'authorized') {
                return (
                  <View style={[styles.cameraPreview, styles.cameraFallback]}>
                    <Text style={styles.cameraFallbackText}>Camera permission not granted</Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
                      <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              // If we do have a device (from explicit discovery or the hook), render it
              const finalDevice = availableDevice;
                if (finalDevice) {
                try {
                  const CameraComp = VisionCamera.Camera;
                  return (
                    <View ref={cameraContainerRef} style={styles.cameraPreviewContainer} onLayout={(e)=>{
                      try {
                        const { width: pw, height: ph } = e.nativeEvent.layout;
                        previewLayout.current.width = pw;
                        previewLayout.current.height = ph;
                        setPreviewSize({ width: pw, height: ph });
                      } catch (err) { /* ignore */ }
                    }}>
                      <CameraComp ref={cameraRef} style={styles.cameraInner} device={finalDevice} isActive={!freeze} />
                    </View>
                  );
                } catch (e) {
                  console.log('VisionCamera render error', e);
                }
              }

              // No device found
              return (
                <View style={[styles.cameraPreview, styles.cameraFallback]}>
                  <Text style={styles.cameraFallbackText}>No camera device detected.
                    On an emulator, enable a virtual camera (AVD settings) or run on a physical device.
                  </Text>
                  {/* Debug info */}
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: '#444' }}>Debug: VisionCamera loaded: {VisionCamera ? 'yes' : 'no'}</Text>
                    <Text style={{ fontSize: 12, color: '#444' }}>cameraPermission: {String(cameraPermission)}</Text>
                    {/* hook-derived device removed: using explicit discovery only */}
                    <Text style={{ fontSize: 12, color: '#444' }}>availableDevices: {availableDevices ? JSON.stringify(availableDevices.map((d:any)=>({id:d.id,position:d.position}))) : 'null'}</Text>
                  </View>
                </View>
              );
            })()
          ) : (
            <View style={[styles.cameraPreview, styles.cameraFallback]}>
              <Text style={styles.cameraFallbackText}>Camera not available</Text>
            </View>
          )}

            {/* Crosshair: full white lines (vertical + horizontal) placed relative to preview */}
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: previewSize?.width ?? '100%', height: previewSize?.height ?? '100%' }}>
              {previewSize && (
                <>
                  <View style={[styles.crosshairVertical, { left: Math.round(previewSize.width / 2) - 1, height: previewSize.height }]} />
                  <View style={[styles.crosshairHorizontal, { top: Math.round(previewSize.height / 2) - 1, width: previewSize.width }]} />
                </>
              )}

              {/* Red dot: centered by default, or placed at crosshairPos when frozen */}
              {freeze && crosshairPos ? (
                <View pointerEvents="none" style={[styles.crosshairContainer, { left: crosshairPos.x - 10, top: crosshairPos.y - 10 }]}>
                  <View style={styles.crosshairDot} />
                </View>
              ) : (
                previewSize && (
                  <View pointerEvents="none" style={[styles.crosshairContainer, { left: Math.round(previewSize.width / 2) - 10, top: Math.round(previewSize.height / 2) - 10 }]}>
                    <View style={styles.crosshairDot} />
                  </View>
                )
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

        {/* Info */}
        <View style={styles.infoArea}>
          <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Family of:</Text>
          <Text style={styles.infoValue}>{detected?.family ?? '—'}</Text>
        </View>
        {colorCodesVisible && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hex:</Text>
            <Text style={styles.infoValue}>{detected?.hex ?? '—'}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Real Name:</Text>
          <Text style={styles.infoValue}>{detected?.realName ?? '—'}</Text>
        </View>

        <TouchableOpacity style={styles.freezeButton} onPress={toggleFreeze} activeOpacity={0.8}>
          <Text style={styles.freezeButtonText}>{freeze ? 'Unfreeze' : 'Freeze Frame'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ColorDetector;
