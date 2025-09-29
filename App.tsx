/**
 * @format
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './screens/SplashScreen/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen/WelcomeScreen';
// DecisionScreen removed; its FAB moved into CLSetting
import YTembedScreen from './screens/YTembedScreen/YTembedScreen';
import ColorDetector from './screens/ColorDetector/ColorDetector';
import CLSetting from './screens/CLSetting/CLSetting';
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
  const [voiceMode, setVoiceMode] = useState<'family' | 'real' | 'disable'>('family');

  const handleSplashFinish = () => {
    setCurrentScreen('welcome');
  };

  const handleWelcomeNext = () => {
    // Skip decision screen — go straight to ColorDetector
    setCurrentScreen('colorDetector');
  };

  const handleNavigateToYT = () => {
    // Navigate to the YouTube embed screen
    console.log('handleNavigateToYT called — navigating to youtube screen');
    setCurrentScreen('youtube');
  };

  const handleBackFromYT = () => {
    // DecisionScreen removed: return to ColorDetector
    setCurrentScreen('colorDetector');
  };

  const handleDetectColors = () => {
    // Navigate to the Color Detector screen
    console.log('Navigating to ColorDetector screen');
    setCurrentScreen('colorDetector');
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
        {currentScreen === 'colorDetector' && (
          <ColorDetector onBack={() => setCurrentScreen('welcome')} openSettings={() => setCurrentScreen('settings')} voiceEnabled={voiceEnabled} colorCodesVisible={colorCodesVisible} voiceMode={voiceMode} />
        )}
        {currentScreen === 'settings' && (
          <CLSetting
            onBack={() => setCurrentScreen('colorDetector')}
            voiceEnabled={voiceEnabled}
            colorCodesVisible={colorCodesVisible}
            voiceMode={voiceMode}
            onToggleVoice={(v: boolean) => setVoiceEnabled(v)}
            onToggleColorCodes={(v: boolean) => setColorCodesVisible(v)}
            onNavigateToYT={handleNavigateToYT}
            onChangeVoiceMode={(m:'family'|'real'|'disable')=>setVoiceMode(m)}
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
