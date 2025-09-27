import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { styles } from './CLSetting.styles';

interface CLSettingProps {
  onBack: () => void;
  voiceEnabled?: boolean;
  colorCodesVisible?: boolean;
  onToggleVoice?: (v:boolean)=>void;
  onToggleColorCodes?: (v:boolean)=>void;
}

const CLSetting: React.FC<CLSettingProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={styles.backText}>←</Text></TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.note}>(Settings UI placeholder — toggles will be added later.)</Text>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={()=>Alert.alert('Saved','Settings saved (placeholder)')}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
    </View>
  );
};

export default CLSetting;
