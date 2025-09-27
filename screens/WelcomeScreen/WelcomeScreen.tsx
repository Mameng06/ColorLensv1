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
          <Text style={styles.description}>
            to ColorLens an AI Based Color{'\n'}
            Recognition and{'\n'}
            Voice Feedback Assistant App{'\n'}
            I will add some text here later
          </Text>
        </View>
      </View>
      
      {/* Next Button */}
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


