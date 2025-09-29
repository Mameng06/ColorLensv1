import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { styles } from './WelcomeScreen.styles';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Welcome Title */}
        <Text style={styles.title}>Welcome</Text>
        
        {/* Description Text */}
          <View style={styles.descriptionContainer}>
          <Text style={styles.description}>Welcome to ColorLens — your AI-based color recognition and voice feedback assistant.</Text>
          <Text style={styles.description}>Use your camera in real time or by uploading an image, ColorLens will help you identify colors, hear their names spoken aloud, and view detailed information like hex codes and color families.</Text>
          <Text style={styles.description}>Perfect for individuals with color vision deficiency, ColorLens enhances independence and confidence in navigating the world of color.</Text>
          <Text style={styles.description}>It's also a valuable tool for designers, educators, and anyone interested in learning more about colors.</Text>
          <Text style={styles.description}>Fast, intuitive, and inclusive</Text>
          <Text style={styles.connectedText}>— ColorLens makes color recognition easy for everyone.</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={onNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;


