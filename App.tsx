/**
 * ColorLens - AI Based Color Recognition and Voice Feedback Assistant App
 * 
 * Tech Stack:
 * - React Native CLI
 * - TypeScript
 * - OpenCV for camera processing
 * - TensorFlow Lite for AI model inference
 * - React Native TTS for voice feedback
 * - libDaltonLens for daltonization algorithms test
 *
 * @format
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './screens/SplashScreen/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen/WelcomeScreen';
import DecisionScreen from './screens/DecisionScreen/DecisionScreen';
import YTembedScreen from './screens/YTembedScreen/YTembedScreen';
// Disabled for now - feature screens commented out to simplify development
// import YTembedScreen from './screens/YTembedScreen/YTembedScreen';
// import ColorDetector from './screens/ColorDetector/ColorDetector';
// import CLSetting from './screens/CLSetting/CLSetting';
// import CBCamera from './screens/CBCamera/CBCamera';
// import SimulateCB from './screens/SimulateCB/SimulateCB.tsx';

const App: React.FC = () => {

  const [currentScreen, setCurrentScreen] = useState<'splash' | 'welcome' | 'decision' | 'youtube' | 'main' | 'colorDetector' | 'settings' | 'cbc' | 'simulate'>('splash');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [colorCodesVisible, setColorCodesVisible] = useState(true);

  const handleSplashFinish = () => {
    setCurrentScreen('welcome');
  };

  const handleWelcomeNext = () => {
    setCurrentScreen('decision');
  };

  const handleNavigateToYT = () => {
    // Navigate to the YouTube embed screen
    console.log('handleNavigateToYT called — navigating to youtube screen');
    setCurrentScreen('youtube');
  };

  const handleBackFromYT = () => {
    // Return to decision screen
    setCurrentScreen('decision');
  };

  const handleDetectColors = () => {
    // Disabled: Color detector temporarily turned off
    console.log('Color detector is disabled in this build');
    setCurrentScreen('decision');
  };

  const handleColorBlindCamera = () => {
    // Disabled: Color-blind camera feature turned off
    console.log('Color-blind camera is disabled in this build');
    setCurrentScreen('decision');
  };

  const handleSimulateCDO = () => {
    // Disabled: Simulation feature turned off
    console.log('Simulation is disabled in this build');
    setCurrentScreen('decision');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'splash' && (
          <SplashScreen onFinish={handleSplashFinish} />
        )}
        {currentScreen === 'welcome' && (
          <WelcomeScreen onNext={handleWelcomeNext} />
        )}
        {currentScreen === 'decision' && (
          <DecisionScreen
            onNavigateToYT={handleNavigateToYT}
            onDetectColors={handleDetectColors}
            onColorBlindCamera={handleColorBlindCamera}
            onSimulateCDO={handleSimulateCDO}
          />
        )}
        {currentScreen === 'youtube' && (
          <YTembedScreen onBack={handleBackFromYT} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
