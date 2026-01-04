import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator, // ✅ Added for the spinner
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import PhoneInput from 'react-native-phone-number-input';
import {getAuth, signInWithPhoneNumber} from '@react-native-firebase/auth';
// ✅ Added Firestore imports
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';

const Otp_screen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [confirmation, setconfirmation] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Added loading state
  const [timer, setTimer] = useState(0);
  const phoneInputRef = useRef(null);
  const otpInputRef = useRef(null); // ✅ Ref to control hidden input focus

  // ✅ FUNCTION TO CHECK IF PHONE NUMBER EXISTS IN FIRESTORE
  const checkIfUserExists = async formattedNumber => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', formattedNumber));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  // ✅ FUNCTION TO VERIFY PHONE NUMBER USING ABSTRACT API
  const handleConfirmPress = async () => {
    if (!phoneInputRef.current || loading) return; // ✅ Prevent multiple clicks

    const formatted = phoneNumber;
    const validLocal = phoneInputRef.current.isValidNumber(formatted);
    setIsValid(validLocal);

    if (!validLocal) {
      return Alert.alert(
        '❌ Invalid Number',
        'Please enter a valid phone number.',
      );
    }

    setLoading(true); // ✅ Disable button and start loading

    try {
      // ✅ 1. Check if user exists in Firestore first (Ethical logic check)
      const exists = await checkIfUserExists(formatted);

      if (!exists) {
        setLoading(false); // ✅ Re-enable on failure
        return Alert.alert(
          'Account Not Found',
          'This phone number is not registered. Please go to the Sign Up screen to create an account.',
        );
      }

      // ✅ 2. Call AbstractAPI to check phone validity
      const response = await fetch(
        `https://phoneintelligence.abstractapi.com/v1/?api_key=82d68d739cbb4daf9e84faf473bda996&phone=${formatted}`,
      );

      const data = await response.json();
      console.log('📞 Validation result:', data);

      // ✅ Handle response and RESTORED original Alert feedback
      if (
        data.phone_validation?.is_valid &&
        data.phone_carrier?.line_type === 'mobile' &&
        data.phone_validation?.line_status === 'active'
      ) {
        // Restored your requested alert feedback
        Alert.alert(
          '✅ Valid Number',
          `This phone number (${formatted}) is active and valid.\nCarrier: ${data.phone_carrier.name}\nCountry: ${data.phone_location.country_name}`,
        );

        // ✅ 3. Proceed with Firebase Phone Sign-In
        console.log('🚀 Starting Firebase Phone Auth...');
        const auth = getAuth();
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
        );

        setconfirmation(confirmationResult);
        setTimer(60); // ✅ Start timer immediately after SMS is sent
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
    } finally {
      setLoading(false); // ✅ Always re-enable button when process ends
    }
  };

  // ✅ FUNCTION TO VERIFY THE OTP CODE
  const handleVerifyCode = async () => {
    try {
      const userCredential = await confirmation.confirm(code);
      console.log('✅ User signed in successfully!');
      // Note: We don't need to 'save' the user here because they already exist in this flow.
    } catch (error) {
      console.log('❌ Invalid code:', error);
      Alert.alert('Error', 'The code entered is incorrect.');
    }
  };
  // ✅ TIMER LOGIC FOR RESEND BUTTON
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // ✅ Force keyboard to reappear by blurring then focusing
  const handleOtpBoxPress = () => {
    if (otpInputRef.current) {
      otpInputRef.current.blur();
      setTimeout(() => {
        otpInputRef.current.focus();
      }, 50);
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

      {!confirmation ? (
        <>
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
                {backgroundColor: isValid && !loading ? '#4CAF50' : '#9a9a9a'},
              ]}
              disabled={!isValid || loading} // ✅ Button is workless during API call
              onPress={handleConfirmPress}>
              {loading ? (
                <ActivityIndicator color="#087d7fff" />
              ) : (
                <Text style={styles.button_phone_text}>Confirm Number</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* OTP input section styled like Figma */}
          <View style={styles.figma_otp_container}>
            <Text style={styles.chattrix_title}>Chattrix</Text>
            
            {/* ✅ TouchableOpacity to refocus keyboard on tap */}
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={handleOtpBoxPress} 
              style={styles.otp_boxes_row}>
              {[0, 1, 2, 3, 4, 5].map(idx => (
                <View key={idx} style={styles.otp_box}>
                  <Text style={styles.otp_text}>{code[idx] || ''}</Text>
                </View>
              ))}
            </TouchableOpacity>

            <TextInput
              ref={otpInputRef} // ✅ Attached ref here
              value={code}
              onChangeText={setCode}
              maxLength={6}
              keyboardType="number-pad"
              style={styles.hidden_input}
              autoFocus={true}
            />

            <View style={styles.verify_text_row}>
              <Text style={styles.helperText}>Enter Verification code </Text>
              <Image
                source={require('../images/Icon.png')}
                style={{width: 20, height: 20}}
              />
            </View>
          </View>

          {/* Verify OTP Button */}
          <View style={styles.button_phone_container}>
            <TouchableOpacity
              style={[
                styles.button_phone,
                {backgroundColor: code.length === 6 ? '#A7A888' : '#9a9a9a'},
              ]}
              disabled={code.length !== 6}
              onPress={handleVerifyCode}>
              <Text style={styles.button_phone_text}>Confirm Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{marginTop: 20}}
              disabled={timer > 0}
              onPress={() => {
                handleConfirmPress(); // This re-triggers the SMS
                setTimer(60); // Starts a 60-second cooldown
              }}>
              <Text
                style={[styles.signup_text, {opacity: timer > 0 ? 0.5 : 1}]}>
                {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  figma_otp_container: {
    alignItems: 'center',
    marginTop: 20,
  },
  chattrix_title: {
    fontSize: 48,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
    marginBottom: 30,
  },
  otp_boxes_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
  },
  otp_box: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otp_text: {
    fontSize: 20,
    color: 'white',
  },
  hidden_input: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: 50,
  },
  verify_text_row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  signup_text: {
    fontSize: 18,
    color: 'white',
    textDecorationLine: 'underline',
  },
});

export default Otp_screen;