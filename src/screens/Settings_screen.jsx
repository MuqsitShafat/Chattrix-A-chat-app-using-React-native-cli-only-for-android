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
import {useTranslation} from 'react-i18next';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager} from 'react-native-fbsdk-next';
import {getAuth, signOut, deleteUser} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc, // Make sure this is added
  serverTimestamp, // Make sure this is added
} from '@react-native-firebase/firestore';

const Settings_screen = ({navigation}) => {
  const {t} = useTranslation();
  //! MOST IRRITATING BUG FIX below:
  const deleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account Permanently',
      'This action CANNOT be undone. You will lose all your chats, contacts, and profile data immediately. Are you absolutely sure?',
      [
        {
          text: 'No, Keep My Account',
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: 'Yes, Delete Everything',
          style: 'destructive',
          onPress: async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            const db = getFirestore();

            if (!user) {
              Alert.alert('Error', 'No active user found.');
              return;
            }

            try {
              console.log('🔐 STEP 1: Challenging Session Freshness...');

              // 1. Refresh token & check if session exists (Modular API)
              const tokenResult = await user.getIdTokenResult(true);

              // 2. THE MANUAL LOCK:
              // Firebase Auth "recent login" window is strictly 5 minutes (300,000ms).
              // We check if (Current Time - Auth Time) > 5 minutes.
              const authTime = new Date(tokenResult.authTime).getTime();
              const now = new Date().getTime();

              if (now - authTime > 300000) {
                // If the session is older than 5 mins, we STOP here.
                // Nothing in Firestore is touched.
                throw {code: 'auth/requires-recent-login'};
              }

              console.log(
                '✅ Session is fresh. Proceeding with atomic wipe...',
              );

              // 3. Delete Sub-collection (contacts)
              const contactsRef = collection(db, 'users', user.uid, 'contacts');
              const contactsSnapshot = await getDocs(contactsRef);
              const deletePromises = contactsSnapshot.docs.map(document =>
                deleteDoc(document.ref),
              );
              await Promise.all(deletePromises);

              // 4. Delete main User Document
              const userDocRef = doc(db, 'users', user.uid);
              await deleteDoc(userDocRef);

              console.log('🔥 Database Vanished. Removing Auth Account...');

              // 5. Clear Social Sessions
              await GoogleSignin.signOut().catch(() => {});
              LoginManager.logOut();

              // 6. FINALLY Delete the Auth account
              // Since our manual check in Step 2 passed, this is guaranteed to work.
              await deleteUser(user);

              Alert.alert('Success', 'Account completely removed.');
            } catch (error) {
              console.error('Deletion Error:', error);

              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Security Re-Login Required',
                  'For deletion, you just have to logout and log back in to delete your account. please log in again and try deleting your account, it will be deleted immediately.',
                );
              } else {
                Alert.alert('Error', 'Failed to delete account.');
              }
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const ViewProfile = () => {
    navigation.navigate('Profile');
  };

  const changePassword = () => {
    Alert.alert(
      'Change Password',
      'Are you sure you want to change your password?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            console.log('OK Pressed');
            navigation.navigate('ChangePassword');
          },
        },
      ],
      {cancelable: false},
    );
  };

  const privacySettings = () => {
    navigation.navigate('PrivacySettings');
  };

  const language = () => {
    navigation.navigate('Language');
  };

  const logout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            console.log('OK Pressed');
            try {
              const auth = getAuth();
              const db = getFirestore();
              const currentUser = auth.currentUser;

              if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                  status: 'offline',
                  lastSeen: serverTimestamp(),
                });
                console.log('User status set to offline in Firestore');
              }

              await signOut(auth);
              await GoogleSignin.signOut();
              LoginManager.logOut();
              console.log('Logout successful.');
            } catch (error) {
              console.error('Logout Error:', error);
              Alert.alert('Error', 'Failed to log out.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={45} color="red" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../images/Frame2.png')} />
        </TouchableOpacity>
      </View>
      <View style={styles.circle}></View>
      <View style={styles.chat_text_view}>
        <Text style={styles.chat_text}>{t('settings')}</Text>
      </View>
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
  container: {flex: 1, backgroundColor: '#FFFFFF'},
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
  chat_text_view: {marginTop: '28%', marginLeft: '4%'},
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
    height: 65,
    backgroundColor: '#bdc8daff',
    borderRadius: 55,
    marginBottom: '4%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: '5%',
    elevation: 10,
  },
  buttonText: {
    color: '#594d6bff',
    fontSize: 24,
    fontFamily: 'InriaSans-Regular',
  },
  arrow: {width: 25, height: 25},
  logoutRow: {flexDirection: 'row', alignItems: 'center'},
  logoutArrow: {marginLeft: 10},
  spacing: {marginTop: '18%'},
});

export default Settings_screen;
