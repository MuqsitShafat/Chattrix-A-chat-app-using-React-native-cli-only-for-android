import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

// 1. MODULAR IMPORTS (Updated)
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  serverTimestamp 
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const ContactInfo_screen = ({navigation}) => {
  const {t} = useTranslation();

  const [name, setname] = useState('');
  const [mobile, setmobile] = useState('');

  const confirmChanges = () => {
    if (name.trim() === '' || mobile.trim() === '') {
      Alert.alert('Error', 'Please enter both name and mobile number');
      return;
    }

    Alert.alert(
      'Confirm Changes',
      'Are you sure you want to save this contact information?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            try {
              // 2. MODULAR SERVICE INITIALIZATION
              const auth = getAuth();
              const db = getFirestore();
              const user = auth.currentUser;

              if (user) {
                // 3. MODULAR DATA SAVING
                // We point to the specific sub-collection path
                const contactsRef = collection(db, 'users', user.uid, 'contacts');
                
                await addDoc(contactsRef, {
                  name: name,
                  mobile: mobile,
                  message: 'New contact added',
                  createdAt: serverTimestamp(), // Modular way to get server time
                });

                Alert.alert('Success', 'Contact saved!');
                setname('');
                setmobile('');
                navigation.goBack();
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Could not save contact.');
            }
          },
        },
      ]
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.borderLeft}></View>
      <View style={styles.borderTop}></View>
      <View style={styles.borderRight}></View>

      <View style={styles.topRow}>
        <TouchableOpacity onPress={goBack}>
          <Image source={require('../images/Frame.png')} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={{alignItems: 'center', marginBottom: 20}}>
          <View style={{width: '100%', height: 35}}></View>
          <Text style={styles.headerTitle}>Contact Info</Text>
          <View style={{width: '100%', height: 25}}></View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter name : </Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setname}
              placeholder=""
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter mobile : </Text>
            <TextInput
              style={styles.textInput}
              value={mobile}
              onChangeText={setmobile}
              placeholder=""
              underlineColorAndroid="transparent"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={{width: '100%', height: 35}}></View>

        <View style={styles.confirmSection}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmChanges}>
            <Text style={styles.confirmButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 45,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 22,
    marginTop: '7%',
  },
  sectionContainer: {
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 7,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 5,
    color: 'black',
  },
  confirmSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: 'transparent',
  },
  confirmButtonText: {
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
    borderTopLeftRadius: 100, // Fixed string percentage warning
    borderTopRightRadius: 100,
    backgroundColor: '#510DC0',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '98%',
    resizeMode: 'contain',
  },
});

export default ContactInfo_screen;