import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
const Settings_screen = ({navigation}) => {
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
        <Text style={styles.chat_text}>Settings</Text>
      </View>

      {/* 6 Touchable buttons */}
      <ScrollView contentContainerStyle={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Delete account</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Edit Profile</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Change Password</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Privacy Settings</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Language</Text>
          <Image style={styles.arrow} source={require('../images/Arrow.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <View style={styles.logoutRow}>
            <Text style={styles.buttonText}>Logout</Text>
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
