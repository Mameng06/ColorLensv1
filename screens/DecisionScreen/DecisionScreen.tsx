import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { styles } from './DecisionScreen.styles';

interface DecisionScreenProps {
  onNavigateToYT: () => void;
  onDetectColors: () => void;
  onColorBlindCamera: () => void;
  onSimulateCDO: () => void;
}

const DecisionScreen: React.FC<DecisionScreenProps> = ({
  onNavigateToYT,
  onDetectColors,
  onColorBlindCamera,
  onSimulateCDO,
}) => {
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  const handleAboutPress = () => {
    Alert.alert(
      'About ColorLens',
      'About ColorLens just add some text and I will change this later. This is a placeholder text for the about section.',
      [{ text: 'OK' }]
    );
    setFabMenuOpen(false);
  };

  const handleVideoTutorialPress = () => {
    onNavigateToYT();
    setFabMenuOpen(false);
  };

  const toggleFabMenu = () => {
    setFabMenuOpen(!fabMenuOpen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>What do you want to do?</Text>
        
        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={onDetectColors}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>Detect Colors</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={onColorBlindCamera}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>Color Blind Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={onSimulateCDO}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>Simulate CDO</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* FAB Menu */}
      <View style={styles.fabContainer}>
        {/* FAB Submenu Items */}
        {fabMenuOpen && (
          <View style={styles.fabSubmenu}>
            <TouchableOpacity 
              style={styles.fabSubmenuItem} 
              onPress={handleVideoTutorialPress}
              activeOpacity={0.8}
            >
              <Text style={styles.fabSubmenuIcon}>►</Text>
              <Text style={styles.fabSubmenuText}>Video Tutorial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fabSubmenuItem} 
              onPress={handleAboutPress}
              activeOpacity={0.8}
            >
              <Text style={styles.fabSubmenuIcon}>?</Text>
              <Text style={styles.fabSubmenuText}>About</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Main FAB Button */}
        <TouchableOpacity 
          style={styles.fabMain} 
          onPress={toggleFabMenu}
          activeOpacity={0.8}
        >
          <Text style={styles.fabMainIcon}>{fabMenuOpen ? '×' : '?'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DecisionScreen;