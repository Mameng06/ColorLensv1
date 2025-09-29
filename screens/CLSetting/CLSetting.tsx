import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Switch } from 'react-native';
import { styles } from './CLSetting.styles';

interface CLSettingProps {
  onBack: () => void;
  voiceEnabled?: boolean;
  colorCodesVisible?: boolean;
  voiceMode?: 'family' | 'real' | 'disable';
  onToggleVoice?: (v:boolean)=>void;
  onToggleColorCodes?: (v:boolean)=>void;
  onNavigateToYT?: ()=>void;
  onChangeVoiceMode?: (m:'family'|'real'|'disable')=>void;
}

const CLSetting: React.FC<CLSettingProps> = ({ onBack, voiceEnabled=true, colorCodesVisible=true, voiceMode='family', onToggleVoice, onToggleColorCodes, onNavigateToYT, onChangeVoiceMode }) => {
  const [localVoiceEnabled, setLocalVoiceEnabled] = useState<boolean>(voiceEnabled);
  const [localColorCodesVisible, setLocalColorCodesVisible] = useState<boolean>(colorCodesVisible);
  const [localVoiceMode, setLocalVoiceMode] = useState<'family'|'real'|'disable'>(voiceMode);

  const saveAndBack = () => {
    onToggleVoice && onToggleVoice(localVoiceEnabled);
    onToggleColorCodes && onToggleColorCodes(localColorCodesVisible);
    onChangeVoiceMode && onChangeVoiceMode(localVoiceMode);
    onBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={styles.backText}>←</Text></TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.row}>
          <View style={{flex:1}}>
            <Text style={styles.label}>Display Hex Color Codes</Text>
            <Text style={styles.note}>on by default</Text>
          </View>
          <Switch value={localColorCodesVisible} onValueChange={(v)=>setLocalColorCodesVisible(v)} />
        </View>

        <View style={styles.row}>
          <View style={{flex:1}}>
            <Text style={styles.label}>Display Family Color</Text>
            <Text style={styles.note}>on by default</Text>
          </View>
          <Switch value={localVoiceEnabled} onValueChange={(v)=>setLocalVoiceEnabled(v)} />
        </View>

        <View style={styles.row}>
          <View style={{flex:1}}>
            <Text style={styles.label}>Display the real name of color</Text>
            <Text style={styles.note}>on by default</Text>
          </View>
          <Switch value={false} onValueChange={()=>{Alert.alert('Not implemented','Placeholder')}} />
        </View>

        <View style={{marginTop:20}}>
          <Text style={styles.label}>Say the color</Text>
          <Text style={styles.note}>selected: {localVoiceMode === 'family' ? 'Family Color' : localVoiceMode === 'real' ? 'Real Name' : 'Disabled'}</Text>
          <View style={{flexDirection:'row', marginTop:8}}>
            <TouchableOpacity style={[styles.choice, localVoiceMode==='family' && styles.choiceSelected]} onPress={()=>setLocalVoiceMode('family')}><Text>Family Color</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.choice, localVoiceMode==='real' && styles.choiceSelected]} onPress={()=>setLocalVoiceMode('real')}><Text>Real Name</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.choice, localVoiceMode==='disable' && styles.choiceSelected]} onPress={()=>setLocalVoiceMode('disable')}><Text>Disable</Text></TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Moved FAB menu (About / Video Tutorial) from DecisionScreen here */}
      <View style={styles.fabContainer}>
        <View style={styles.fabSubmenu}>
          <TouchableOpacity style={styles.fabSubmenuItem} onPress={()=>{ onNavigateToYT && onNavigateToYT(); }}><Text style={styles.fabSubmenuIcon}>►</Text><Text style={styles.fabSubmenuText}>Video Tutorial</Text></TouchableOpacity>
          <TouchableOpacity style={styles.fabSubmenuItem} onPress={()=>Alert.alert('About','About ColorLens placeholder')}><Text style={styles.fabSubmenuIcon}>?</Text><Text style={styles.fabSubmenuText}>About</Text></TouchableOpacity>
        </View>
      </View>

  {/* Save button removed per user request; settings apply immediately via callbacks */}
    </View>
  );
};

export default CLSetting;
