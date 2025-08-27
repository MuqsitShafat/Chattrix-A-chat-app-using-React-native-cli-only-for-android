import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

const {width, height} = Dimensions.get('screen');

const Custom_Drawer = props => {
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
            <Image
              source={require('../images/Person.png')}
              style={styles.profileImage}
            />
            <Text style={[styles.image_below_text, {marginTop: '4%'}]}>
              George
            </Text>
            <Text style={[styles.image_below_text, {marginTop: '2%'}]}>
              +001-234567-091
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Drawer Items */}
      <View style={styles.drawerListWrapper}>
        <DrawerItemList {...props} />
      </View>

      {/* Bottom Options */}
      <View style={styles.bottomSection}>
        <View style={styles.share_app_box}>
          <Image source={require('../images/Shareappicon.png')} />
          <Text style={styles.share_app}>Share App</Text>
        </View>
        <View style={styles.about_app_box}>
          <Text style={styles.about}>About App</Text>
          <Image
            source={require('../images/alertcircle.png')}
            style={{marginLeft: '5%'}}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.chattrix_box}>
        <Text style={styles.Chattrix}>Chattrix</Text>
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
  },
  profileImage: {
    marginTop: '10%',
    height: '75%',
    width: '65%',
    aspectRatio: 1,
    borderRadius: 99999,
  },
  image_below_text: {
    fontSize: 30,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  drawerListWrapper: {
    backgroundColor: '#510DC0',
    marginHorizontal: '-4.8%',
    marginTop: '7%',
  },
  bottomSection: {
    backgroundColor: '#510DC0',
    alignItems: 'center',
    paddingTop: '2%',
    marginHorizontal: '-4.8%',
  },
  share_app_box: {
    marginLeft: '-18%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '9%',
  },
  share_app: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
    marginLeft: '8%',
  },
  about_app_box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '5%',
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
    height: '12%',
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
