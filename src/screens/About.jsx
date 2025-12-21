import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';

const About = ({navigation}) => {
  const {t} = useTranslation();

  const goBack = () => {
  // 🔑 CHANGE: Instead of goBack(), navigate specifically to the Home tab
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
        <Text style={styles.headerTitle}>{t('about_app')}</Text>
        <View style={styles.placeholder}></View>
      </View>

      {/* About Content - Added padding so text doesn't hit the side borders */}
      <View style={styles.AboutContent}>
        <Text style={styles.AboutText}>{t('about_app_screen')}</Text>
      </View>

      {/* Blue Circle - Fixed to the bottom */}
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
    marginTop: StatusBar.currentHeight + 10, // Added 10 for better spacing from the top border
  },
  headerTitle: {
    fontSize: 44,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  placeholder: {
    width: 30,
  },
  AboutContent: {
    marginTop: '10%',
    paddingHorizontal: 30, // Keeps text away from purple side borders
    alignItems: 'center',
  },
  AboutText: {
    fontSize: 22, // Adjusted slightly for better fit
    color: 'black',
    fontFamily: 'InriaSans-Italic',
    textAlign: 'center',
    lineHeight: 32,
    color: '#588564ff',
  },
  blue_circle: {
    position: 'absolute', // 🔑 Keeps it at the bottom
    bottom: 0, // 🔑 Sticks to the bottom
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '35%',
    // borderTopLeftRadius: 300, // Using numbers for cleaner circles
    borderTopRightRadius: 300,
    backgroundColor: '#510DC0',
    overflow: 'hidden',
  },
  image: {
    width: '105%',
    height: '105%',
    resizeMode: 'contain',
  },
});

export default About;
