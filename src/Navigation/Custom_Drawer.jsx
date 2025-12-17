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
import { useTranslation } from 'react-i18next';

const {width, height} = Dimensions.get('screen');

const Custom_Drawer = props => {
  const {t} = useTranslation();
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
              {t('george')}
            </Text>
            <Text style={[styles.image_below_text, {marginTop: '2%'}]}>
              +001-234567-091
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Drawer Items */}
      <View style={styles.drawerListWrapper}>
        {/* <DrawerItemList {...props} /> */}
        {props.state.routes.map((route, index) => {
          // Skip rendering "Tabs" (our Home)
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

        {/* Override Home drawer item */}
        <TouchableOpacity
          style={styles.customDrawerItem}
          onPress={() =>
            props.navigation.navigate('Tabs', {screen: 'Home_Chat_navigator'})
          }
          activeOpacity={0.7}>
          <Image source={require('../images/Homeicon.png')} />
          <Text style={styles.drawerItemLabel}>{t('home')}</Text>
        </TouchableOpacity>

        {/* Custom Call button inside drawer */}
        <TouchableOpacity
          style={styles.customDrawerItem}
          onPress={() => props.navigation.navigate('Tabs', {screen: 'Call'})}
          activeOpacity={0.7}>
          <Image source={require('../images/Callicon.png')} />
          <Text style={styles.drawerItemLabel}>{t('call')}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Options */}
      <View style={styles.bottomSection}>
        <View style={styles.share_app_box}>
          <Image source={require('../images/Shareappicon.png')} />
          <Text style={styles.share_app}>{t('share_app')}</Text>
        </View>
        <View style={styles.about_app_box}>
          <Text style={styles.about}>{t('about_app')}</Text>
          <Image
            source={require('../images/alertcircle.png')}
            style={{marginLeft: '5%'}}
          />
        </View>
      </View>

      {/* Footer */}
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
