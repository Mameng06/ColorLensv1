import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TouchableWithoutFeedback, Platform, PermissionsAndroid, Image } from 'react-native';
import { ICONS } from '../../Images';
import { styles } from './ColorDetector.styles';
import { getRandomColor } from './ColorDetectorLogic';
import { speak } from '../../utils/tts';

// Optional camera modules (lazy-require)
let RNCamera: any = null;
let VisionCamera: any = null;
try { RNCamera = require('react-native-camera').RNCamera; } catch (err) { RNCamera = null; }
try { VisionCamera = require('react-native-vision-camera'); } catch (err) { VisionCamera = null; }

// Crosshair config: tweak these to change length (factor of preview), thickness (px), and dot size
const CROSSHAIR_LENGTH_FACTOR = 0.5; // 0..1 portion of preview dimension (0.5 = 50%)
const CROSSHAIR_LENGTH_FACTOR_FROZEN = 0.35; // shorter lines when frozen to preserve appearance
const CROSSHAIR_THICKNESS = 2; // px line thickness
const CROSSHAIR_DOT_SIZE = 10; // px diameter of center dot (visual size)
const CROSSHAIR_DOT_BORDER = 2; // px border around dot (white ring)
// Container size should include the dot plus border so centering math is consistent across devices
const CROSSHAIR_CONTAINER_SIZE = CROSSHAIR_DOT_SIZE + CROSSHAIR_DOT_BORDER * 2;

interface ColorDetectorProps {
  onBack: () => void;
  openSettings: () => void;
  voiceEnabled?: boolean;
  colorCodesVisible?: boolean;
  voiceMode?: 'family' | 'real' | 'disable';
  showFamily?: boolean;
  showRealName?: boolean;
}

const ColorDetector: React.FC<ColorDetectorProps> = ({ onBack, openSettings, voiceEnabled=true, colorCodesVisible=true, voiceMode='family', showFamily=true, showRealName=true }) => {
  // detected: user-selected sample while frozen (set on tap)
  const [detected, setDetected] = useState<{family:string,hex:string,realName:string} | null>(null);
  // liveDetected: continuously-updated live sample shown while not frozen
  const [liveDetected, setLiveDetected] = useState<{family:string,hex:string,realName:string} | null>(null);
  // frozenSnapshot: snapshot of the live sample at the moment the user froze the frame
  const [frozenSnapshot, setFrozenSnapshot] = useState<{family:string,hex:string,realName:string} | null>(null);
  const [_running, setRunning] = useState(true);
  const [freeze, setFreeze] = useState(false);
  const [crosshairPos, setCrosshairPos] = useState<{x:number,y:number}|null>(null);
  const intervalRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const previewLayout = useRef<{x:number,y:number,width:number,height:number}>({ x:0,y:0,width:0,height:0 });
  const previewRef = useRef<any>(null);
  const cameraContainerRef = useRef<any>(null);
  const [previewSize, setPreviewSize] = useState<{width:number,height:number} | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  // throttle live speech so we don't spam the user when live detection updates rapidly
  const lastSpokenRef = useRef<number>(0);
  const LIVE_SPEAK_COOLDOWN = 1200; // ms
  const [cameraPermission, setCameraPermission] = useState<string | null>(null);
  // We'll discover devices explicitly using the VisionCamera APIs (getAvailableCameraDevices)
  const [availableDevices, setAvailableDevices] = useState<any[] | null>(null);
  const availableDevice = availableDevices ? availableDevices.find((d:any) => d.position === 'back') ?? availableDevices[0] : null;

  // Start detection and check permissions on mount
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
      } catch (err) {
        console.log('permission check failed', err);
        setCameraPermission(null);
      }
    };
    checkPermission();

    startDetection();
    return () => stopDetection();
    // startDetection/stopDetection are stable local functions (no external deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch (err) {
        console.log('discover devices failed', err);
      }
    };
    discover();
  }, [cameraPermission]);

  // Speak when a new color family is detected
  useEffect(() => {
    // Only speak automatically while not frozen — when frozen we speak only on user taps
    if (!liveDetected || !voiceEnabled || freeze) return;
    if (voiceMode === 'disable') return;
    try {
      const now = Date.now();
      if (now - lastSpokenRef.current < LIVE_SPEAK_COOLDOWN) return;
      const textToSpeak = voiceMode === 'real' ? liveDetected.realName : liveDetected.family;
      const ok = speak(textToSpeak);
      lastSpokenRef.current = now;
      if (!ok) Alert.alert('Color', textToSpeak);
    } catch (err) {
      console.log('TTS speak failed', err);
      const textToSpeak = voiceMode === 'real' ? liveDetected.realName : liveDetected.family;
      Alert.alert('Color', textToSpeak);
    }
  }, [liveDetected, voiceEnabled, freeze, voiceMode]);

  const startDetection = () => {
    stopDetection();
    intervalRef.current = setInterval(() => {
      // When running and not frozen, update the live detected sample for UI only
      if (!freeze) {
        const c = getRandomColor();
        // Update liveDetected so the TTS effect can speak (throttled by cooldown)
        setLiveDetected(c);
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
    console.log('toggleFreeze ->', next);
    if (!next) {
      // unfreezing -> reset crosshair to center
      setCrosshairPos(null);
      // clear frozen snapshot when unfreezing
      setFrozenSnapshot(null);
      // clear any uploaded image so camera preview resumes
      setSelectedImageUri(null);
    } else {
      // when freezing, set crosshair to center initially
      // center will be computed based on preview size; fallback to center of cameraArea via styles
      // measure the preview wrapper in window coordinates then set center
      setTimeout(() => {
        try {
          if (previewRef.current && previewRef.current.measureInWindow) {
            previewRef.current.measureInWindow((px: number, py: number, pw: number, ph: number) => {
              previewLayout.current = { x: px, y: py, width: pw, height: ph };
              const center = { x: pw / 2, y: ph / 2 };
              setCrosshairPos(center);
              // capture a frozen snapshot of the current live detection so UI doesn't update continuously
              setFrozenSnapshot(liveDetected);
              console.log('toggleFreeze: measured preview ->', { px, py, pw, ph });
              // Do NOT automatically sample or speak when freezing; user will tap to sample.
            });
          }
        } catch (err) { setCrosshairPos(null); }
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
          console.log('onScreenPress page:', { pageX, pageY }, 'preview measure:', { px, py, pw, ph });
          previewLayout.current = { x: px, y: py, width: pw, height: ph };
          const relX = Math.max(0, Math.min(pw, pageX - px));
          const relY = Math.max(0, Math.min(ph, pageY - py));
          console.log('onScreenPress relative:', { relX, relY });
          setCrosshairPos({ x: relX, y: relY });
          // when frozen, tapping selects a new sampled color at that point
          const c = getRandomColor();
          setDetected(c);
          // update frozen snapshot to reflect the user-selected sample for display
          setFrozenSnapshot(c);
          // speak immediately for taps while frozen (bypass live cooldown)
          if (voiceEnabled && voiceMode !== 'disable') {
            try {
                const textToSpeak = voiceMode === 'real' ? c.realName : c.family;
                const ok = speak(textToSpeak);
                lastSpokenRef.current = Date.now();
                if (!ok) Alert.alert('Color', textToSpeak);
              } catch (err) { /* ignore */ }
          }
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
    } catch (err) {
      console.log('requestCameraPermission failed', err);
    }
  };

  // Pick an image from the phone's library and treat it as a sampled frame.
  const pickImage = async () => {
    try {
      // Lazy-require so the project doesn't hard-depend on the native module at build-time
      let ImagePicker: any = null;
      try { ImagePicker = require('react-native-image-picker'); } catch (err) { ImagePicker = null; }
      if (!ImagePicker) {
        Alert.alert('Image Picker', 'Image picker not installed. Install react-native-image-picker to enable this feature.');
        return;
      }

      // Use the callback API since different versions expose different shapes
      ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
        try {
          if (!response) return;
          if (response.didCancel) return;
          // `assets` is the modern response shape
          const uri = (response.assets && response.assets[0] && response.assets[0].uri) || response.uri || null;
          if (!uri) return;
          setSelectedImageUri(uri);
          // For now, simulate sampling by picking a random color (replace with real image sampling later)
          const sampled = getRandomColor();
          setDetected(sampled);
          setFrozenSnapshot(sampled);
          setFreeze(true);
          // speak sample immediately if allowed
          if (voiceEnabled && voiceMode !== 'disable') {
            try {
              const textToSpeak = voiceMode === 'real' ? sampled.realName : sampled.family;
              speak(textToSpeak);
            } catch (err) { /* ignore */ }
          }
        } catch (innerErr) {
          console.log('image pick callback failed', innerErr);
        }
      });
    } catch (err) {
      console.log('pickImage failed', err);
      Alert.alert('Image Picker', 'Failed to open image picker.');
    }
  };

    // Compute the center point used by the crosshair lines.
    // When frame is frozen and the user has moved the crosshair, use that position.
    // Otherwise use the visual center of the preview.
    const centerX = previewSize ? (freeze && crosshairPos ? crosshairPos.x : previewSize.width / 2) : 0;
    const centerY = previewSize ? (freeze && crosshairPos ? crosshairPos.y : previewSize.height / 2) : 0;
    const lengthFactor = freeze ? CROSSHAIR_LENGTH_FACTOR_FROZEN : CROSSHAIR_LENGTH_FACTOR;
    // Decide what to display in the info area:
    // - while frozen: prefer frozenSnapshot (snapshot at freeze time) or detected (user tap)
    // - while live: prefer liveDetected
    const displayDetected = freeze ? (frozenSnapshot ?? detected) : liveDetected ?? detected;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
          <Image source={ICONS.ARROWicon} style={styles.backIconImage} />
        </TouchableOpacity>
  <TouchableOpacity onPress={() => { openSettings(); }} style={styles.settingsButton}><Text style={styles.settingsText}>⚙️</Text></TouchableOpacity>
        {/* spacer for header actions */}
      </View>

      {/* Camera area (placeholder image) */}
      <TouchableWithoutFeedback onPress={onScreenPress}>
        <View style={styles.cameraArea}>
          {/* preview wrapper measured for crosshair coordinate mapping */}
          <View style={styles.previewWrapper}>
          {/* If the user has uploaded an image, display it in the preview area instead of the live camera */}
          {selectedImageUri ? (
            <View ref={(el)=>{ cameraContainerRef.current = el; previewRef.current = el; }} style={styles.cameraPreviewContainer} onLayout={(e)=>{
                      try {
                        const { width: pw, height: ph } = e.nativeEvent.layout;
                        previewLayout.current.width = pw;
                        previewLayout.current.height = ph;
                        setPreviewSize({ width: pw, height: ph });
                      } catch (innerErr) { /* ignore */ }
            }}>
              <Image source={{ uri: selectedImageUri }} style={[styles.cameraInner, { resizeMode: 'cover' }]} />
            </View>
          ) : RNCamera ? (
            <View ref={(el)=>{ cameraContainerRef.current = el; previewRef.current = el; }} style={styles.cameraPreviewContainer} onLayout={(e)=>{
                      try {
                        const { width: pw, height: ph } = e.nativeEvent.layout;
                        previewLayout.current.width = pw;
                        previewLayout.current.height = ph;
                        setPreviewSize({ width: pw, height: ph });
                      } catch (innerErr) { /* ignore */ }
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
                    <View ref={(el)=>{ cameraContainerRef.current = el; previewRef.current = el; }} style={styles.cameraPreviewContainer} onLayout={(e)=>{
                      try {
                        const { width: pw, height: ph } = e.nativeEvent.layout;
                        previewLayout.current.width = pw;
                        previewLayout.current.height = ph;
                        setPreviewSize({ width: pw, height: ph });
                      } catch (innerErr) { /* ignore */ }
                    }}>
                      <CameraComp ref={cameraRef} style={styles.cameraInner} device={finalDevice} isActive={!freeze} />
                    </View>
                  );
                } catch (innerErr) {
                  console.log('VisionCamera render error', innerErr);
                }
              }

              // No device found
              return (
                <View style={[styles.cameraPreview, styles.cameraFallback]}>
                  <Text style={styles.cameraFallbackText}>No camera device detected.
                    On an emulator, enable a virtual camera (AVD settings) or run on a physical device.
                  </Text>
                  {/* Debug info */}
                  <View style={styles.debugBlock}>
                    <Text style={styles.debugText}>Debug: VisionCamera loaded: {VisionCamera ? 'yes' : 'no'}</Text>
                    <Text style={styles.debugText}>cameraPermission: {String(cameraPermission)}</Text>
                    {/* hook-derived device removed: using explicit discovery only */}
                    <Text style={styles.debugText}>availableDevices: {availableDevices ? JSON.stringify(availableDevices.map((d:any)=>({id:d.id,position:d.position}))) : 'null'}</Text>
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
      <View pointerEvents="none" style={[styles.absoluteOverlay, { width: previewSize?.width ?? '100%', height: previewSize?.height ?? '100%' }]}>
              {previewSize && (
                <>
                  {/* Vertical line: centered, height = previewHeight * CROSSHAIR_LENGTH_FACTOR */}
                  <View
                    style={[
                      styles.crosshairVertical,
                      {
                        left: Math.round(centerX) - Math.round(CROSSHAIR_THICKNESS / 2),
                        // extend more so the dot fully overlays the lines without a visible break
                        height: Math.round(previewSize.height * lengthFactor) + Math.round(CROSSHAIR_CONTAINER_SIZE),
                        top: Math.round(previewSize.height * ((1 - lengthFactor) / 2)) - Math.round(CROSSHAIR_CONTAINER_SIZE / 2),
                        width: CROSSHAIR_THICKNESS,
                      },
                    ]}
                  />

                  {/* Horizontal line: centered, width = previewWidth * CROSSHAIR_LENGTH_FACTOR */}
                  <View
                    style={[
                      styles.crosshairHorizontal,
                      {
                        top: Math.round(centerY) - Math.round(CROSSHAIR_THICKNESS / 2),
                        // extend horizontally so the dot overlay doesn't create a visible gap
                        width: Math.round(previewSize.width * lengthFactor) + Math.round(CROSSHAIR_CONTAINER_SIZE),
                        left: Math.round(previewSize.width * ((1 - lengthFactor) / 2)) - Math.round(CROSSHAIR_CONTAINER_SIZE / 2),
                        height: CROSSHAIR_THICKNESS,
                      },
                    ]}
                  />
                  {/* filler bars: drawn above the lines but beneath the dot to mask any seam */}
                  <View pointerEvents="none" style={[styles.fillerBar, { left: Math.round(centerX) - Math.round((CROSSHAIR_CONTAINER_SIZE * 1.2) / 2), top: Math.round(centerY) - Math.round((CROSSHAIR_THICKNESS + 1) / 2), width: Math.round(CROSSHAIR_CONTAINER_SIZE * 1.2), height: CROSSHAIR_THICKNESS + 1 }]} />
                  <View pointerEvents="none" style={[styles.fillerBar, { left: Math.round(centerX) - Math.round((CROSSHAIR_THICKNESS + 1) / 2), top: Math.round(centerY) - Math.round((CROSSHAIR_CONTAINER_SIZE * 1.2) / 2), width: CROSSHAIR_THICKNESS + 1, height: Math.round(CROSSHAIR_CONTAINER_SIZE * 1.2) }]} />
                </>
              )}

              {/* Red dot: centered by default, or placed at crosshairPos when frozen */}
              {freeze && crosshairPos ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.crosshairContainer,
                    { width: CROSSHAIR_CONTAINER_SIZE, height: CROSSHAIR_CONTAINER_SIZE, left: crosshairPos.x - Math.round(CROSSHAIR_CONTAINER_SIZE / 2), top: crosshairPos.y - Math.round(CROSSHAIR_CONTAINER_SIZE / 2) },
                  ]}
                >
                  <View style={[styles.crosshairDot, { width: CROSSHAIR_DOT_SIZE, height: CROSSHAIR_DOT_SIZE, borderRadius: Math.round(CROSSHAIR_DOT_SIZE / 2), borderWidth: CROSSHAIR_DOT_BORDER }]} />
                </View>
              ) : (
                previewSize && (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.crosshairContainer,
                      { width: CROSSHAIR_CONTAINER_SIZE, height: CROSSHAIR_CONTAINER_SIZE, left: Math.round(previewSize.width / 2) - Math.round(CROSSHAIR_CONTAINER_SIZE / 2), top: Math.round(previewSize.height / 2) - Math.round(CROSSHAIR_CONTAINER_SIZE / 2) },
                    ]}
                  >
                    <View style={[styles.crosshairDot, { width: CROSSHAIR_DOT_SIZE, height: CROSSHAIR_DOT_SIZE, borderRadius: Math.round(CROSSHAIR_DOT_SIZE / 2), borderWidth: CROSSHAIR_DOT_BORDER }]} />
                  </View>
                )
              )}
    </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

        {/* Info */}
        <View style={styles.infoArea}>
          {showFamily && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family of:</Text>
              <Text style={styles.infoValue}>{displayDetected?.family ?? '—'}</Text>
            </View>
          )}
        {colorCodesVisible && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hex:</Text>
            <Text style={styles.infoValue}>{displayDetected?.hex ?? '—'}</Text>
          </View>
        )}
        {showRealName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Real Name:</Text>
            <Text style={styles.infoValue}>{displayDetected?.realName ?? '—'}</Text>
          </View>
        )}

        {/* Upload image from library (samples a color and freezes) */}
        <View style={styles.uploadRow}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.uploadButtonContent}>
              <Image source={ICONS.UploadIcon} style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </View>
          </TouchableOpacity>
          {selectedImageUri && (
            <Image source={{ uri: selectedImageUri }} style={styles.thumbnail} />
          )}
        </View>

        <TouchableOpacity style={[styles.freezeButton, freeze && styles.unfreezeButton]} onPress={toggleFreeze} activeOpacity={0.8}>
          <Text style={styles.freezeButtonText}>{freeze ? 'Unfreeze' : 'Freeze Frame'}</Text>
        </TouchableOpacity>
        {/* end info area */}
      </View>
    </View>
  );
};

export default ColorDetector;
