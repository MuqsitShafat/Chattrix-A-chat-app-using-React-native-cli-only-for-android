import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';

const PrivacySettings_screen = ({navigation}) => {
  const {t} = useTranslation();
  const [showEmail, setShowEmail] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [allowMessage, setAllowMessage] = useState(false);
  const [allowCall, setAllowCall] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleOK = () => {
    Alert.alert(
      'Privacy Settings',
      'Your privacy settings have been saved.',
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('Privacy settings saved');
            navigation.goBack();
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      {/* Overlay Background */}
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} onPress={goBack} />
        
        {/* Privacy Settings Modal */}
        <View style={styles.modalContainer}>
          {/* Lock Icon */}
          <View style={styles.lockIconContainer}>
            <Image source={require('../images/Lock.png')} style={styles.lockIcon} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('privacy_settings')}</Text>

          {/* Settings Options */}
          <View style={styles.settingsContainer}>
            {/* Show my email address */}
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>{t('show_email')}</Text>
              <Switch
                value={showEmail}
                onValueChange={setShowEmail}
                trackColor={{false: '#D3D3D3', true: '#510DC0'}}
                thumbColor={showEmail ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#D3D3D3"
              />
            </View>

            {/* Show my Online Status */}
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>{t('show_online_status')}</Text>
              <Switch
                value={showOnlineStatus}
                onValueChange={setShowOnlineStatus}
                trackColor={{false: '#D3D3D3', true: '#510DC0'}}
                thumbColor={showOnlineStatus ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#D3D3D3"
              />
            </View>

            {/* Allow users to message me */}
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>{t('allow_message')}</Text>
              <Switch
                value={allowMessage}
                onValueChange={setAllowMessage}
                trackColor={{false: '#D3D3D3', true: '#510DC0'}}
                thumbColor={allowMessage ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#D3D3D3"
              />
            </View>

            {/* Allow users to call me */}
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>{t('allow_call')}</Text>
              <Switch
                value={allowCall}
                onValueChange={setAllowCall}
                trackColor={{false: '#D3D3D3', true: '#510DC0'}}
                thumbColor={allowCall ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#D3D3D3"
              />
            </View>
          </View>

          {/* Terms Agreement */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              {t('terms_agreement')}{'\n'}
              <Text style={styles.linkText}>Terms of Service</Text>, <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>

          {/* OK Button */}
          <TouchableOpacity style={styles.okButton} onPress={handleOK}>
            <Text style={styles.okButtonText}>{t('ok')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    width: '85%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
lockIconContainer: {
  position: 'absolute',
  top: -15,
  alignSelf: 'center',
  backgroundColor: '#FFFFFF',
  width: 40,          // ✅ fixed size
  height: 40,         // ✅ fixed size
  borderRadius: 9999,   // ✅ half of width/height → circle
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden', // ✅ makes the image crop
},
lockIcon: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover', // ✅ ensures it fills the circle
},
  title: {
    fontSize: 24,
    color: 'black',
    fontFamily: 'InriaSans-Bold',
    textAlign: 'center',
    marginVertical: 25,
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'InriaSans-Regular',
    flex: 1,
    marginRight: 15,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  checkboxContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#D3D3D3',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#D3D3D3',
    borderColor: '#D3D3D3',
  },
  checkmark: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'InriaSans-Italic',
    flex: 1,
    lineHeight: 16,
  },
  linkText: {
    color: '#510DC0',
    fontFamily: 'InriaSans-Italic',
  },
  okButton: {
    backgroundColor: '#510DC0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    alignSelf: 'center',
    width: 170,
  },
  okButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'InriaSans-Light',
  },
});

export default PrivacySettings_screen;