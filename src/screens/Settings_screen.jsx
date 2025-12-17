import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { useTranslation } from 'react-i18next';
const Settings_screen = ({navigation}) => {
 const { t } = useTranslation();
const deleteAccount = () => {
  Alert.alert(
    'Delete Account', // Title
    'Are you sure you want to delete your account?', // Message
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => console.log('OK Pressed'),
        // logic comes when the OK button is pressed and acc is deleted
      },
    ],
    {
      cancelable: false,
    },
  );
};
const  ViewProfile = () => {
  // Navigation to view profile comes here 
  navigation.navigate('Profile')
};
const changePassword = () => {
  Alert.alert(
    'Change Password', // Title
    'Are you sure you want to change your password?', // Message
    [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {console.log('OK Pressed')
          navigation.navigate('ChangePassword')
        },
        // logic comes when yes is pressed and change password section is opened
      },
    ],
    {
      cancelable: false,
    },
  );
};
const privacySettings = () => {
  // a navigation to privacy settings page will come here
 navigation.navigate('PrivacySettings')
};
const language = ()=>{
  // a navigation to language settings page will come here
  navigation.navigate('Language')

}
const logout=()=>{
  Alert.alert(
    'Logout', // Title
    'Are you sure you want to logout?', // Message
    [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => console.log('OK Pressed'),
        // logic comes when yes is pressed and logout section is opened
      },
    ],
    {
      cancelable: false,
    },
  )
}
  return (
    <View style={styles.container}>
      {/* Top Row with menu & search icons */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          {/* <Image source={require('../images/menu.png')} /> */}
          <Icon name="menu" size={45} color="red" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../images/Frame2.png')} />
        </TouchableOpacity>
      </View>

      {/* Circle on the top right corner of screen */}
      <View style={styles.circle}></View>

      {/* Chat text */}
      <View style={styles.chat_text_view}>
        <Text style={styles.chat_text}>{t('settings')}</Text>
      </View>

      {/* 6 Touchable buttons */}
      <ScrollView contentContainerStyle={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={ViewProfile}>
          <Text style={styles.buttonText}>{t('view_profile')}</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={deleteAccount}>
          <Text style={styles.buttonText}>{t('delete_account')}</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={changePassword}>
          <Text style={styles.buttonText}>{t('change_password')}</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={privacySettings}>
          <Text style={styles.buttonText}>{t('privacy_settings')}</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={language}>
          <Text style={styles.buttonText}>{t('language')}</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <View style={styles.logoutRow}>
            <Text style={styles.buttonText}>{t('logout')}</Text>
            <Image
              style={styles.logoutArrow}
              source={require('../images/Logoutarrow.png')}
            />
          </View>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.spacing}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: StatusBar.currentHeight,
    zIndex: 1,
  },
  circle: {
    width: '70%',
    height: '30%',
    backgroundColor: '#510DC0',
    borderBottomLeftRadius: 300,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  chat_text_view: {
    marginTop: '28%',
    marginLeft: '4%',
  },
  chat_text: {
    fontSize: 51,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
    marginBottom: '4%',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '3%',
  },
  button: {
    width: '90%',
    height: 70,
    backgroundColor: '#D3E2F8',
    borderRadius: 55,
    marginBottom: '3%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: '5%',
    elevation: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'Roboto Light',
  },
  arrow: {
    width: 25,
    height: 25,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutArrow: {
    marginLeft: 10,
  },
  spacing: {
    marginTop: '18%',
  },
});

export default Settings_screen;
