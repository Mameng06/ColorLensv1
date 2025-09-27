import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { styles } from './YTembedScreen.styles';

interface YTembedScreenProps {
  onBack: () => void;
}

const YTembedScreen: React.FC<YTembedScreenProps> = ({ onBack }) => {
  // Replace with your actual YouTube video ID
  const youtubeVideoId = 'qIkLXRTS6Ik'; // Example video ID
  const youtubeUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;

  // Lazy-load WebView to avoid typecheck/build failures when package is not installed
  let WebViewComponent: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    WebViewComponent = require('react-native-webview').WebView;
  } catch (e) {
    WebViewComponent = null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Tutorial</Text>
      </View>
      
      {/* YouTube Video Embed */}
      <View style={styles.videoContainer}>
        {WebViewComponent ? (
          <WebViewComponent
            source={{ uri: youtubeUrl }}
            style={styles.webView}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : (
          <View style={[styles.webView, {justifyContent:'center',alignItems:'center'}]}>
            <Text style={{color:'#666'}}>Install react-native-webview to play videos inside the app.</Text>
          </View>
        )}
      </View>
      
      {/* Video Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ColorLens Tutorial</Text>
        <Text style={styles.infoDescription}>
          Learn how to use ColorLens app features including color detection, 
          color blind camera, and simulation tools.
        </Text>
      </View>
    </View>
  );
};

export default YTembedScreen;
