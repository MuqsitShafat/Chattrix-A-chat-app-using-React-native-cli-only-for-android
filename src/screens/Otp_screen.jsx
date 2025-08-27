import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React from 'react';

const Otp_screen = () => {
  return (
    <View style={styles.container}>
      {/* Circle with image */}
      <View style={styles.blue_circle}>
        <Image
          style={styles.image}
          source={require('../images/emojicropped.png')}
        />
        {/* back arrow button on left side */}
        <TouchableOpacity style={styles.back_arrow}>
          <Image source={require('../images/Frame.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* App name text */}
      <View style={styles.text_container}>
        <Text style={styles.text}>Chattrix</Text>
      </View>

      {/* 6 boxes */}
      <View style={styles.box_container}>
        <View style={styles.box}>
          {/* <Text style={styles.box_text}>1</Text> */}
        </View>
        <View style={styles.box}>
          {/* <Text style={styles.box_text}>2</Text> */}
        </View>
        <View style={styles.box}>
          {/* <Text style={styles.box_text}>3</Text> */}
        </View>
        <View style={styles.box}>
          {/* <Text style={styles.box_text}>4</Text> */}
        </View>
        <View style={styles.box}>
          {/* <Text style={styles.box_text}>5</Text> */}
        </View>
        <View style={styles.box}>
          {/* <Text style={styles.box_text}>6</Text> */}
        </View>
      </View>

      {/* Enter verification code */}
      <View style={styles.verification_text_container}>
        <Text style={styles.verification_text}>Enter verification code</Text>
        <Image source={require('../images/Icon.png')} />
      </View>

      {/* Confirm button */}
      <View style={styles.button_phone_container}>
        <TouchableOpacity style={styles.button_phone}>
          <Text style={styles.button_phone_text}>Confirm Code</Text>
        </TouchableOpacity>
      </View>

      {/* Resend code */}
      <View style={styles.resend_container}>
        <TouchableOpacity>
          <Text style={styles.resend_text}>Resend Code</Text>
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
  back_arrow: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  text_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    marginTop: '15%',
  },
  text: {
    fontSize: 75,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
  },
  box_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '15%',
    flexDirection: 'row',
  },
  box: {
    width: 50,
    height: 60,
    backgroundColor: 'white',
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: '#510DC0',
  },
  box_text: {
    fontSize: 25,
    color: 'white',
  },
  verification_text_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '13%',
    flexDirection: 'row',
  },
  verification_text: {
    marginRight: '2%',
    fontSize: 23,
    color: 'white',
    fontFamily: 'InstrumentSans-Regular',
  },
  button_phone_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '7%',
  },
  button_phone: {
    width: '85%',
    height: 60,
    backgroundColor: '#A7A888',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    // marginBottom: 10,
    elevation: 5,
  },
  button_phone_text: {
    fontSize: 20,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'InstrumentSans-Regular',
  },
  resend_container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '7%',
  },
  resend_text: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'InstrumentSans-Regular',
    textDecorationLine: 'underline',
  },
});

export default Otp_screen;
