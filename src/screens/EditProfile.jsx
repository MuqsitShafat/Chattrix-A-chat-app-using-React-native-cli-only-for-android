import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import React, {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
// Modular Firebase Imports
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, writeBatch } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfile_screen = ({navigation}) => {
 const {t} = useTranslation();
  const [newName, setNewName] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setCurrentName(userDoc.data().name || userDoc.data().displayName || '');
      }
    }
  };

  const confirmChanges = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a new name');
      return;
    }

    Alert.alert(
      'Confirm Changes',
      'Are you sure you want to save these changes?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: async () => {
            setLoading(true);
            try {
              // Only update the user's own profile name
              await updateDoc(doc(db, 'users', user.uid), {
                name: newName,
              });

              setCurrentName(newName);
              setNewName('');
              Alert.alert('Success', 'Profile name updated');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to update name');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  const addNewPicture = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1, 
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      const source = response.assets[0].uri;
      setLoading(true);

      try {
        // 1. Upload to Firebase Storage
        const reference = storage().ref(`profile_pics/${user.uid}.jpg`);
        await reference.putFile(source);
        const url = await reference.getDownloadURL();

        // 2. Update Current User's Document
        await updateDoc(doc(db, 'users', user.uid), {
          profilePic: url,
        });

        // 3. GLOBAL UPDATE for Image only: Update profilePic in everyone's contact list
        const batch = writeBatch(db);
        const allUsersSnapshot = await getDocs(collection(db, 'users'));

        for (const userDoc of allUsersSnapshot.docs) {
          // Check the 'contacts' sub-collection of every user to see if the current user is in it
          const contactRef = doc(db, 'users', userDoc.id, 'contacts', user.uid);
          const contactSnap = await getDoc(contactRef);
          
          if (contactSnap.exists()) {
            // We ONLY update profilePic, leaving aliasName untouched
            batch.update(contactRef, { profilePic: url });
          }
        }

        await batch.commit();
        Alert.alert('Success', 'Profile picture updated for everyone!');
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setLoading(false);
      }
    });
  };

  const goBack = () => {
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
        <Text style={styles.headerTitle}>{t('edit_profile')}</Text>
        <View style={styles.placeholder}></View>
      </View>

      {/* Edit Details Section */}
      <View style={styles.editDetailsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Text style={styles.editDetailsText}>{t('edit_details_here')}</Text>
        )}
      </View>

      {/* Add New Picture Section */}
      <View style={styles.nameSection}>
        <Text style={styles.addPictureLabel}>{t('add_new_picture') }:  </Text>

      </View>
      <View style={styles.addPictureSection}>
        <TouchableOpacity style={styles.addPictureButton} onPress={addNewPicture} disabled={loading}>
          <Icon name="add" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Name Input Section */}
      <View style={styles.nameSection}>
        <Text style={styles.nameLabel}>{t('name')}: <Text style={[styles.nameLabel,{fontFamily:'Poppins-Regular'}]}>{currentName}</Text></Text>
        <View style={styles.newNameContainer}>
          <Text style={styles.newNameLabel}>{t('new_name')}: </Text>
          <TextInput
            style={styles.newNameInput}
            value={newName}
            onChangeText={setNewName}
            placeholder=""
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      {/* Confirm Changes Button */}
      <View style={styles.confirmSection}>
        <TouchableOpacity style={styles.confirmButton} onPress={confirmChanges} disabled={loading}>
          <Text style={styles.confirmButtonText}>{t('confirm_changes')}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom line */}
      <View style={styles.bottomLine}></View>
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
    marginTop: StatusBar.currentHeight ,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 40,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  placeholder: {
    width: 30,
  },
  editDetailsContainer: {
    alignItems: 'center',
    marginVertical: '8%',
  },
  editDetailsText: {
    backgroundColor: '#510DC0',
    color: 'white',
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    elevation: 5,
  },
  addPictureSection: {
    alignItems: 'center',
    marginBottom: '10%',
    marginTop: '-2%',
},
  addPictureLabel: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15,
  },
  addPictureButton: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  nameSection: {
    paddingHorizontal: 30,
    marginBottom: '8%',
  },
  nameLabel: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
  },
  newNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newNameLabel: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  newNameInput: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 5,
    marginLeft: 5,
  },
  confirmSection: {
    alignItems: 'center',
    marginTop: '5%',
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
  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#510DC0',
    zIndex: 3,
  },
});

export default EditProfile_screen;