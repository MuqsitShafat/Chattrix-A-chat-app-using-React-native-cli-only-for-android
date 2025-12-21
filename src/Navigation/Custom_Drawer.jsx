import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {useTranslation} from 'react-i18next';
// ADDED: Modular Firebase Auth import
import {getAuth} from '@react-native-firebase/auth';

const {width, height} = Dimensions.get('screen');

const Custom_Drawer = props => {
  const {t} = useTranslation();

  // ADDED: Fetching real-time user data from Firebase
  const auth = getAuth();
  const user = auth.currentUser;

  // Logic for Dynamic Data:
  // 1. Name: Uses Google/FB name. If null, uses localized 'user' instead of hardcoded 'george'
  const userName = user?.displayName || t('user');

  // 2. Identifier: Uses Email (Google/FB) or Phone Number
  const userIdentifier = user?.email || user?.phoneNumber || 'NA';

  // FIX: Request a higher resolution image from Google/FB
  let photoUrl = user?.photoURL;
  if (photoUrl && photoUrl.includes('googleusercontent.com')) {
    // Replaces the small 's96-c' with a larger 's400-c'
    photoUrl = photoUrl.replace('s96-c', 's400-c');
  } else if (photoUrl && photoUrl.includes('facebook.com')) {
    // Appends type=large to Facebook URLs
    photoUrl = `${photoUrl}?type=large`;
  }

  // 3. Profile Image: Use the "photoUrl" variable we just cleaned up above
  // CHANGED: Fixed reference from user.photoURL to the new photoUrl variable
  const profilePic = photoUrl
    ? {uri: photoUrl}
    : require('../images/User_profile_icon.jpg');

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        backgroundColor: '#D9D9D9',
        flexGrow: 1,
        marginTop: '-2.7%',
      }}>
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../images/Profilebackgroundpic.png')}
          style={styles.imageBackground}
          resizeMode="stretch">
          <View style={styles.profileContainer}>
            {/* CHANGED: Added resizeMethod to help with distortion */}
            <Image
              source={profilePic}
              style={styles.profileImage}
              resizeMethod="auto"
            />
            {/* CHANGED: Dynamic Name with t('user') fallback */}
            <Text
              style={[styles.image_below_text, {marginTop: '5%'}]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {userName}
            </Text>
            {/* CHANGED: Dynamic Email/Phone with Auto-Scaling to prevent untidy look */}
            <Text
              style={[
                styles.image_below_text,
                {
                  fontSize: 28,
                  fontFamily: 'InriaSans-Italic',
                  color: '#3b6d56ff',
                  textDecorationStyle: 'solid',
                  textDecorationColor: '#3b6d56ff',
                  textDecorationLine: 'underline',
                },
              ]} // Smaller base font for long emails
              numberOfLines={1}
              adjustsFontSizeToFit>
              {userIdentifier}
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Drawer Items */}
      <View style={styles.drawerListWrapper}>
        {/* <DrawerItemList {...props} /> */}
        {props.state.routes.map((route, index) => {
          if (route.name === 'Tabs') return null;
          const focused = index === props.state.index;
          return (
            <DrawerItem
              key={route.key}
              label={
                props.descriptors[route.key].options.drawerLabel || route.name
              }
              focused={focused}
              onPress={() => props.navigation.navigate(route.name)}
            />
          );
        })}

        <TouchableOpacity
          style={styles.customDrawerItem}
          onPress={() =>
            props.navigation.navigate('Tabs', {screen: 'Home_Chat_navigator'})
          }
          activeOpacity={0.7}>
          <Image source={require('../images/Homeicon.png')} />
          <Text style={styles.drawerItemLabel}>{t('home')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.customDrawerItem}
          onPress={() => props.navigation.navigate('Tabs', {screen: 'Call'})}
          activeOpacity={0.7}>
          <Image source={require('../images/Callicon.png')} />
          <Text style={styles.drawerItemLabel}>{t('call')}</Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM SECTION - UPDATED */}
      <View style={styles.bottomSection}>
        <View style={styles.share_app_box}>
          <Image source={require('../images/Shareappicon.png')} />
          <Text style={styles.share_app}>{t('share_app')}</Text>
        </View>

        {/* ADDED: TouchableOpacity wrapper and onPress navigation to About screen */}
        <TouchableOpacity
          style={styles.about_app_box}
          activeOpacity={0.7}
          onPress={() => {
            props.navigation.navigate('Tabs', {
              screen: 'Settings',
              params: {
                screen: 'About',
              },
            });
          }}>
          <Text style={styles.about}>{t('about_app')}</Text>
          <Image
            source={require('../images/alertcircle.png')}
            style={{marginLeft: '5%'}}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.chattrix_box}>
        <Text style={styles.Chattrix}>{t('chattrix')}</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9D9D9',
    marginBottom: '5%',
  },
  imageBackground: {
    width: '100%',
    height: height * 0.4,
    marginBottom: '1%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10%',
    width: '80%', // Added width to give text space to scale
  },
  profileImage: {
    marginTop: '10%',
    height: height * 0.25, // Fixed height for consistency
    width: height * 0.25,
    borderRadius: 999999, // Perfect circle
    elevation: 10,
    backgroundColor: '#ccc', // Smooth placeholder
  },
  image_below_text: {
    fontSize: 28,
    color: 'black',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  drawerListWrapper: {
    backgroundColor: '#510DC0',
    marginHorizontal: '-4.8%',
    marginTop: '11%',
  },
  customDrawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    marginLeft: 20,
  },
  drawerItemLabel: {
    fontSize: 34,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
    marginLeft: 20,
  },
  bottomSection: {
    backgroundColor: '#510DC0',
    alignItems: 'center',
    paddingTop: '2%',
    marginHorizontal: '-4.8%',
  },
  share_app_box: {
    marginLeft: '-13%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '8%',
    marginBottom: '-4%',
    marginTop: '-4%',
  },
  share_app: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
    marginLeft: '7%',
  },
  about_app_box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '7%',
  },
  about: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
    marginRight: '5%',
    marginLeft: '-2%',
  },
  chattrix_box: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '16%',
    backgroundColor: 'rgba(0, 0, 0, 0.73)',
    marginHorizontal: '-4.8%',
    marginTop: '-0.1%',
  },
  Chattrix: {
    fontSize: 60,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
    textAlign: 'center',
  },
});

export default Custom_Drawer;
