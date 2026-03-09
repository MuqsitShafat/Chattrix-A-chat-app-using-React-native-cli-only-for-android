import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import { GOOGLE_WEB_CLIENT_ID } from '@env'; // 👈 ADD THIS at top

// ✅ Added Firestore imports
import { getFirestore, doc, setDoc, getDoc } from '@react-native-firebase/firestore';

// ✅ Google Sign-In & Firebase Auth
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';

// 2. DATABASE SYNC LOGIC: This ensures that when an existing user signs back in,
// their searchable profile in Firestore is updated without losing custom changes.
async function saveUserToFirestore(user) {
  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    // Check if user already exists to protect custom name and photo
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // PROTECTION LOGIC:
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email ? user.email.toLowerCase() : '',
        name: userData.name || user.displayName || 'Chattrix User',
        profilePic: userData.profilePic || user.photoURL || '',
      }, { merge: true });
    } else {
      // New User: Save name and photo for the very first time
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email ? user.email.toLowerCase() : '',
        name: user.displayName || 'Chattrix User',
        profilePic: user.photoURL || '',
      }, { merge: true });
    }
  } catch (error) {
    console.error('Firestore Sync Error:', error);
  }
}

//? Google Sign-In function
async function onGoogleButtonPress() {
  try {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const signInResult = await GoogleSignin.signIn();
    let idToken = signInResult.data?.idToken || signInResult.idToken;

    if (!idToken) throw new Error('No ID token found');

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(getAuth(), googleCredential);
    
    // Trigger the save to Firestore
    await saveUserToFirestore(userCredential.user);
    
    return userCredential;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
}

//? Facebook Sign-In function
async function onFacebookButtonPress() {
  try {
    console.log('🟢 Starting Facebook login...');
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    if (result.isCancelled) return;

    const data = await AccessToken.getCurrentAccessToken();
    if (!data) throw new Error('No access token found');

    const credential = FacebookAuthProvider.credential(data.accessToken);
    const auth = getAuth();
    const userCredential = await signInWithCredential(auth, credential);

    // Trigger the save to Firestore
    await saveUserToFirestore(userCredential.user);

    return userCredential;
  } catch (error) {
    console.error('🔴 Facebook Sign-In Error:', error);
  }
}

const Signin = ({navigation}) => {
  useEffect(() => {
  GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID, // 👈 was the hardcoded string
});


  }, []);

  return (
    <View style={styles.container}>
      {/* Top Circle */}
      <View style={styles.blue_circle}>
        <Image
          style={styles.image}
          source={require('../images/emojicropped.png')}
        />
      </View>

      {/* App Name */}
      <View style={styles.text_container}>
        <Text style={styles.text}>Chattrix</Text>
      </View>

      {/* Social Sign-In Buttons */}
      <View style={styles.buttons_container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            onGoogleButtonPress().then(() =>
              console.log('Signed in with Google and synced to Firestore!'),
            )
          }>
          <Image
            source={require('../images/iconGoogle.png')}
            style={styles.icon}
          />
          <Text style={styles.buttons_text}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            onFacebookButtonPress().then(() =>
              console.log('Signed in with Facebook and synced to Firestore!'),
            )
          }>
          <Image
            source={require('../images/Facebook.png')}
            style={styles.icon}
          />
          <Text style={styles.buttons_text}>Sign in with Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* OR Divider */}
      <View style={styles.or_container}>
        <View style={styles.line}></View>
        <Text style={styles.or}>or</Text>
        <View style={styles.line}></View>
      </View>

      {/* Phone Sign-In */}
      <View style={styles.button_phone_container}>
        <TouchableOpacity 
          style={styles.button_phone}
          onPress={() => navigation.navigate('Otp_screen')}
        >
          <Text style={styles.button_phone_text}>
            Sign in with phone number
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Prompt */}
      <View style={styles.dont_text_container}>
        <Text style={styles.dont_text}>Don't have an account?</Text>
      </View>

      <View style={styles.Signup_view}>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signup_text}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#510DC0',
  },
  blue_circle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '30%',
    borderBottomLeftRadius: '50%',
    borderBottomRightRadius: '50%',
    backgroundColor: '#635A71',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  text_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '5%',
  },
  text: {
    fontSize: 72,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
  },
  buttons_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '10%',
  },
  button: {
    flexDirection: 'row',
    width: '85%',
    height: 60,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    borderRadius: 99,
    marginBottom: 10,
    elevation: 10,
  },
  icon: {
    marginLeft: '7%',
    width: 22,
    height: 22,
    marginRight: 10,
  },
  buttons_text: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'InstrumentSans-Regular',
  },
  or_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5%',
  },
  line: {
    width: '37%',
    height: 1,
    backgroundColor: 'black',
  },
  or: {
    fontSize: 25,
    color: 'white',
    marginHorizontal: 10,
  },
  button_phone_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '5%',
  },
  button_phone: {
    width: '85%',
    height: 60,
    backgroundColor: '#A7A888',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    elevation: 10,
  },
  button_phone_text: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'InstrumentSans-Regular',
  },
  dont_text_container: {
    alignItems: 'center',
    marginTop: '5%',
  },
  dont_text: {
    fontSize: 20,
    color: '#CFCFCF',
    fontFamily: 'InstrumentSans-Regular',
  },
  Signup_view: {
    alignItems: 'center',
    marginTop: '2%',
  },
  signup_text: {
    fontSize: 20,
    color: '#BBF2A1',
    fontFamily: 'InstrumentSans-Regular',
    textDecorationLine: 'underline',
  },
});

export default Signin;