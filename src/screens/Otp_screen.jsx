import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState, useRef} from 'react';
import PhoneInput from 'react-native-phone-number-input';
import {getAuth, signInWithPhoneNumber} from '@react-native-firebase/auth';
const Otp_screen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [confirmation, setconfirmation] = useState(null);
  const phoneInputRef = useRef(null);

  // ✅ FUNCTION TO VERIFY PHONE NUMBER USING ABSTRACT API
  const handleConfirmPress = async () => {
    if (!phoneInputRef.current) return;

    const formatted = phoneNumber;
    const validLocal = phoneInputRef.current.isValidNumber(formatted);
    setIsValid(validLocal);

    if (!validLocal) {
      return Alert.alert(
        '❌ Invalid Number',
        'Please enter a valid phone number.',
      );
    }

    try {
      // ✅ Your AbstractAPI key
      // const API_KEY = '82d68d739cbb4daf9e84faf473bda996'; //! I used directly in URL for simplicity

      // ✅ Call AbstractAPI to check phone validity
      const response = await fetch(
        `https://phoneintelligence.abstractapi.com/v1/?api_key=82d68d739cbb4daf9e84faf473bda996&phone=${formatted}`,
      );

      const data = await response.json();
      console.log('📞 Validation result:', data);

      // ✅ Handle response
      if (
        data.phone_validation?.is_valid &&
        data.phone_carrier?.line_type === 'mobile' &&
        data.phone_validation?.line_status === 'active'
      ) {
        Alert.alert(
          '✅ Valid Number',
          `This phone number (${formatted}) is active and valid.\nCarrier: ${data.phone_carrier.name}\nCountry: ${data.phone_location.country_name}`,
        );

        // ✅ Proceed with Firebase Phone Sign-In  //!To be checked
        console.log('🚀 Starting Firebase Phone Auth...');
        const auth = getAuth();
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber);

        setconfirmation(confirmationResult);
        console.log('📲 Firebase confirmation sent:', confirmationResult);
      } else {
        Alert.alert(
          '❌ Invalid or Inactive',
          'This number appears to be invalid or inactive.',
        );
      }
    } catch (error) {
      console.log('❌ Error verifying phone:', error);
      Alert.alert('Error', 'Something went wrong while verifying the number.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Circle with image */}
      <View style={styles.blue_circle}>
        <Image
          style={styles.image}
          source={require('../images/emojicropped.png')}
        />
        <TouchableOpacity style={styles.back_arrow}>
          <Image source={require('../images/Frame.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Phone input */}
      <View style={styles.phone_input_container}>
        <PhoneInput
          ref={phoneInputRef}
          defaultValue={phoneNumber}
          defaultCode="PK"
          layout="first"
          withDarkTheme
          onChangeFormattedText={text => {
            setPhoneNumber(text);
            if (phoneInputRef.current) {
              const valid = phoneInputRef.current.isValidNumber(text);
              setIsValid(valid);
            }
          }}
          containerStyle={[
            styles.phoneContainer,
            {borderColor: isValid ? '#4CAF50' : '#635A71'},
          ]}
          textContainerStyle={styles.textContainerStyle}
          textInputStyle={styles.textInput}
        />

        <Text style={styles.helperText}>
          {isValid ? '✅ Valid phone number' : 'Enter phone number'}
        </Text>
      </View>

      {/* Confirm Button */}
      <View style={styles.button_phone_container}>
        <TouchableOpacity
          style={[
            styles.button_phone,
            {backgroundColor: isValid ? '#4CAF50' : '#9a9a9a'},
          ]}
          disabled={!isValid}
          onPress={handleConfirmPress}>
          <Text style={styles.button_phone_text}>Confirm Number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#510DC0'},
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
  image: {width: '100%', height: '100%', resizeMode: 'contain'},
  back_arrow: {position: 'absolute', left: 20, top: 20},
  phone_input_container: {width: '90%', alignSelf: 'center', marginTop: 20},
  phoneContainer: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#b41bd33c',
  },
  textContainerStyle: {
    backgroundColor: '#8977bdff',
    borderRadius: 12,
  },
  textInput: {color: '#000000', fontSize: 16},
  helperText: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    elevation: 5,
  },
  button_phone_text: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'InstrumentSans-Regular',
  },
});

export default Otp_screen;
