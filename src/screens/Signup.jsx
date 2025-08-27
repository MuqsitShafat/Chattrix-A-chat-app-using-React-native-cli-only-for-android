import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React from 'react';

const Signup = () => {
  return (
    <View style={styles.container}>
      {/* Circle */}
      <View style={styles.blue_circle}>
        <Image
          style={styles.image}
          source={require('../images/emojicropped.png')}
        />
      </View>
      {/* Circle below text */}
      <View style={styles.text_container}>
        <Text style={styles.text}>Sign Up</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttons_container}>
        <TouchableOpacity style={styles.button}>
          <Image
            source={require('../images/iconGoogle.png')}
            style={styles.icon}
          />
          <Text style={styles.buttons_text}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Image
            source={require('../images/Facebook.png')}
            style={styles.icon}
          />
          <Text style={styles.buttons_text}>Continue with facebook</Text>
        </TouchableOpacity>
      </View>

      {/* or with lines */}
      <View style={styles.or_container}>
        <View style={styles.line}></View>
        <Text style={styles.or}>or</Text>
        <View style={styles.line}></View>
      </View>

      {/* Continue with phone no. button */}
      <View style={styles.button_phone_container}>
        <TouchableOpacity style={styles.button_phone}>
          <Text style={styles.button_phone_text}>
            Continue with phone number
          </Text>
        </TouchableOpacity>
      </View>

      {/* Already have an account */}
      <View style={styles.dont_text_container}>
        <Text style={styles.dont_text}>Already have an account ?</Text>
      </View>

      {/* Sign in */}
      <View style={styles.Signup_view}>
        <TouchableOpacity>
          <Text style={styles.signup_text}>Sign in</Text>
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
    // justifyContent: 'center',
    borderRadius: 99,
    marginBottom: 10,
    elevation: 10,
  },
  icon: {
    marginLeft: '7%',
    width: 22,
    height: 22,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons_text: {
    fontSize: 20,
    color: 'black',
    justifyContent: 'center',
    alignItems: 'center',
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
    // marginBottom: 10,
    elevation: 10,
  },
  button_phone_text: {
    fontSize: 20,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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
export default Signup;
