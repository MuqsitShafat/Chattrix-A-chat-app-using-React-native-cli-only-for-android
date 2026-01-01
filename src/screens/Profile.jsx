import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
// Modular Firebase Imports
import {getAuth} from '@react-native-firebase/auth';
import {getFirestore, doc, onSnapshot} from '@react-native-firebase/firestore';

const Profile_screen = ({navigation}) => {
  const {t} = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Real-time listener for user profile data
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const editProfile = () => {
    navigation.navigate('EditProfile');
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Logic to determine what to show in the "Phone/Identifier" field
  const getIdentifier = () => {
    if (!userData) return '';
    // Priority: Display phone if exists, otherwise email
    return userData.phoneNumber || userData.email || t('no_identifier');
  };

  // Logic for Profile Picture fallback
  const getProfilePic = () => {
    let photoUrl = userData?.profilePic;

    if (photoUrl && photoUrl !== '') {
      // FIX: Request a higher resolution image from Google/FB
      if (photoUrl.includes('googleusercontent.com')) {
        // Replaces the small 's96-c' with a larger 's500-c'
        photoUrl = photoUrl.replace('s96-c', 's500-c');
      } else if (photoUrl.includes('facebook.com')) {
        // Appends type=large to Facebook URLs
        photoUrl = `${photoUrl}?type=large`;
      }
      return {uri: photoUrl};
    }
    // Fallback image as requested
    return require('../images/User_profile_icon.jpg');
  };

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#510DC0" />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <View style={styles.placeholder}></View>
      </View>

      {/* Profile Content */}
      <View style={styles.profileContent}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={getProfilePic()}
            style={styles.profileImage}
            // 🔑 High resolution rendering logic
            resizeMethod="resize"
          />
        </View>

        {/* Name and Login Identifier (Phone or Email) */}
        <Text style={styles.name}>{userData?.name || userData?.displayName || 'User'}</Text>
        <Text style={styles.phone}>{getIdentifier()}</Text>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={editProfile}>
          <Text style={styles.editButtonText}>{t('edit_profile')}</Text>
        </TouchableOpacity>
      </View>

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
  },
  headerTitle: {
    fontSize: 44,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  placeholder: {
    width: 30,
  },
  profileContent: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
    marginTop: '10%',
  },
  profileImageContainer: {
    width: 180,
    height: 180,
    borderRadius: 9999999,
    overflow: 'hidden',
    marginBottom: '10%',
    backgroundColor: '#E1E1E1', // Background for image loading
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 29,
    color: '#000000',
    fontFamily: 'Milonga-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 22, // Adjusted slightly for longer emails
    color: '#000000',
    fontFamily: 'Roboto-Light',
    textAlign: 'center',
    marginBottom: 30,
    textDecorationLine: 'underline',
  },
  editButton: {
    marginTop: '1%',
  },
  editButtonText: {
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
    borderTopLeftRadius: 300, // Fixed string percentage issue
    borderTopRightRadius: 300,
    backgroundColor: '#510DC0',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default Profile_screen;