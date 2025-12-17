import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { useTranslation } from 'react-i18next';
const Profile_screen = ({navigation}) => {
  const {t} = useTranslation();
  const editProfile = () => {
    // Navigation to edit profile comes here
    navigation.navigate('EditProfile');
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
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <View style={styles.placeholder}></View>
      </View>
      {/* Profile Content */}
      <View style={styles.profileContent}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../images/Person.png')}
            style={styles.profileImage}
          />
        </View>
        {/* Name and Phone */}
        <Text style={styles.name}>Muqsit Shafat Hussain</Text>
        <Text style={styles.phone}>+1-02515-521</Text>
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
    width: 181,
    height: 170,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: '10%',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 29,
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 29,
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 30,
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
    borderTopLeftRadius: '50%',
    borderTopRightRadius: '50%',
    backgroundColor: '#510DC0',
      overflow: 'hidden', // 🔑 clips the image inside
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
export default Profile_screen;
