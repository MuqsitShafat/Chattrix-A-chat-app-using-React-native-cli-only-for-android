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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 1. MODULAR IMPORTS (Updated for 2025 compatibility)
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  getDoc,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const ContactInfo_screen = ({ navigation }) => {
  const { t } = useTranslation();

  const [name, setname] = useState(''); // This is the Alias Name (like WhatsApp)
  const [identifier, setIdentifier] = useState(''); // Email or Username search

const confirmChanges = async () => {
  if (name.trim() === '' || identifier.trim() === '') {
    Alert.alert('Error', 'Please enter both an Alias Name and their username or email.');
    return;
  }

  try {
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    if (identifier.toLowerCase() === currentUser.email?.toLowerCase()) {
      Alert.alert('Error', 'You cannot add yourself as a contact.');
      return;
    }

    // 1. SEARCH: Does this user exist in Chattrix?
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', identifier.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      Alert.alert('Not Found', 'This user is not registered on Chattrix.');
      return;
    }

    const friendDoc = querySnapshot.docs[0];
    const friendData = friendDoc.data();
    const friendId = friendDoc.id;

    // 2. NEW CHECK: Is this friend already in my contact list?
    const myContactDocRef = doc(db, 'users', currentUser.uid, 'contacts', friendId);
    const checkSnapshot = await getDoc(myContactDocRef);

    if (checkSnapshot.exists()) {
      // Logic: If the document exists, they are already added!
      Alert.alert(
        'Already Added', 
        `${friendData.name || 'This user'} is already in your chat list.`
      );
      return; // Stop the code here
    }

    // 3. SAVE: Only runs if the check above was false
    await setDoc(myContactDocRef, {
      aliasName: name,
      originalName: friendData.name || 'Chattrix User',
      friendId: friendId,
      email: friendData.email,
      profilePic: friendData.profilePic || '', 
      addedAt: serverTimestamp(),
    });

    Alert.alert('Success', `${name} has been added to your chat list!`);
    navigation.goBack();

  } catch (error) {
    console.error("Firebase Error: ", error);
    Alert.alert('Error', 'Something went wrong.');
  }
};

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Visual Borders */}
      <View style={styles.borderLeft}></View>
      <View style={styles.borderTop}></View>
      <View style={styles.borderRight}></View>

      <View style={styles.topRow}>
        <TouchableOpacity onPress={goBack}>
          <Image source={require('../images/Frame.png')} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: '100%', height: 35 }}></View>
          <Text style={styles.headerTitle}>Add Contact</Text>
          <View style={{ width: '100%', height: 25 }}></View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Friend's Information</Text>

          {/* Alias Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Alias Name: </Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setname}
              placeholder="e.g. Bestie"
              placeholderTextColor="#999"
            />
          </View>

          {/* Search Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Search: </Text>
            <TextInput
              style={styles.textInput}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Email or Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.confirmSection}>
          <TouchableOpacity style={styles.confirmButton} onPress={confirmChanges}>
            <Text style={styles.confirmButtonText}>Save & Start Chat</Text>
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
