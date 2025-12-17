import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';

const ChangePassword_screen = ({navigation}) => {
  const {t} = useTranslation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

const confirmChanges = () => {
  Alert.alert(
    'Confirm Changes',
    'Are you sure you want to save these changes?',
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Save',
        onPress: () => {
          console.log('Save Pressed');

          // ✅ Clear all states
          setName('');
          setMobile('');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    ],
    { cancelable: false }
  );
};

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Border Lines */}
      <View style={styles.borderLeft}></View>
      <View style={styles.borderTop}></View>
      <View style={styles.borderRight}></View>

      {/* Top Row with back button */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={goBack}>
          <Image source={require('../images/Frame.png')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('change_password')}</Text>
        <View style={styles.placeholder}></View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('personal_info')}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('enter_name')}</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder=""
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('enter_mobile')}</Text>
            <TextInput
              style={styles.textInput}
              value={mobile}
              onChangeText={setMobile}
              placeholder=""
              keyboardType="phone-pad"
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('password')}</Text>
            <TextInput
              style={styles.textInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder=""
              secureTextEntry={true}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('password_section')}:</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('new_password')}</Text>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder=""
              secureTextEntry={true}
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('confirm_password')}</Text>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder=""
              secureTextEntry={true}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        {/* Confirm Changes Button */}
        <View style={styles.confirmSection}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmChanges}>
            <Text style={styles.confirmButtonText}>{t('confirm_password')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Purple Circle with Chat Bubbles */}
      <View style={styles.blue_circle}>
        <Image
          style={styles.image}
          source={require('../images/Profile_emoji.png')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  borderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 8,
    height: '100%',
    backgroundColor: '#510DC0',
    zIndex: 3,
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#510DC0',
    zIndex: 3,
  },
  borderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
    height: '100%',
    backgroundColor: '#510DC0',
    zIndex: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: StatusBar.currentHeight,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 23,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  placeholder: {
    width: 30,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 22,
    marginTop: '7%',
  },
  sectionContainer: {
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 7,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // ensures the label baseline aligns with the input underline
    marginBottom: 10, // spacing between rows
  },
  inputLabel: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 5,
    color: 'black',
  },
  confirmSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: 'transparent',
  },
  confirmButtonText: {
    color: '#3EABAA',
    fontSize: 22,
    fontFamily: 'Milonga-Regular',
    textDecorationLine: 'underline',
  },
  blue_circle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '32%',
    borderTopLeftRadius: '50%',
    borderTopRightRadius: '50%',
    backgroundColor: '#510DC0',
    overflow: 'hidden', // 🔑 clips the image inside
  },
  image: {
    width: '100%',
    height: '98%',
    resizeMode: 'contain',
  },
});

export default ChangePassword_screen;
