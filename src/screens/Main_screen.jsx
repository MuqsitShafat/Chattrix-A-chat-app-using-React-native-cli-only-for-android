// 1. Add imports
import React, {useState, useEffect} from 'react';
// New Modular way:
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import LottieView from 'lottie-react-native';
const users = [
  {
    name: 'Ahmed Ali',
    message: 'Assalamu Alaikum!',
    image: require('../images/profile.png'),
  },
  {
    name: 'Fatima Zahra',
    message: 'How are you today?',
    image: require('../images/profile.png'),
  },
  {
    name: 'Hassan Raza',
    message: 'Let’s meet after Jummah.',
    image: require('../images/profile.png'),
  },
  {
    name: 'Muqsit',
    message: 'Hope you’re doing well!',
    image: require('../images/profile.png'),
  },
];

const Main_screen = ({navigation}) => {
  const {t} = useTranslation();
  // 2. Change state to hold dynamic users
  const [dynamicUsers, setDynamicUsers] = useState([]);

  // Initialize services
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser; // No more brackets after auth
    if (!user) return;

    // 1. Define the path to your collection
    const contactsRef = collection(db, 'users', user.uid, 'contacts');

    // 2. Create a query (e.g., ordering by date)
    const q = query(contactsRef, orderBy('createdAt', 'desc'));

    // 3. Set up the listener
    const unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        const friends = [];
        querySnapshot.forEach(documentSnapshot => {
          friends.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id, // q kai flatlist key extractor kay liay
            image: require('../images/profile.png'),
          });
        });
        setDynamicUsers(friends);
      },
      error => {
        console.error('Snapshot error: ', error);
      },
    );

    return () => unsubscribe(); // which tells Firebase: "Hey, stop watching for changes now, the user has left this screen to avoid battery/data drain
  }, []);

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
        <Text style={styles.chat_text}>{t('chat')}</Text>
      </View>

      {/* User List */}
      {/* 4. Update FlatList data */}
      {dynamicUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../assets/animations/empty_list.json')}
            autoPlay
            loop
            style={styles.lottieStyle}
          />
          <Text style={styles.emptyText}>
            {t('connect_friends')}{'\n'}
            <Text style={styles.subText}>{t('hit_add_button')}</Text>
          </Text>
        </View>
      ) : (
        <FlatList
          data={dynamicUsers}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingHorizontal: '8%', paddingTop: '10%'}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.flatlist_container}
              onPress={() =>
                navigation.navigate('Chat', {
                  friendId: item.id,
                  friendName: item.name,
                })
              }>
              <Image source={item.image} style={styles.profileImage} />
              <View style={styles.chatContent}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userMessage}>{item.mobile}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {/* Floating Add Contact Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Add_Contact')}>
        <Image
          source={require('../images/add_contacts.png')}
          style={styles.floatingIcon}
        />
      </TouchableOpacity>
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
    marginTop: '18%',
    marginLeft: '5%',
    marginBottom: '3%',
  },
  chat_text: {
    fontSize: 80,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  flatlist_container: {
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    padding: '4%',
    marginBottom: '5%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatContent: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'IrishGrover-Regular',
    color: '#333',
  },
  userMessage: {
    fontSize: 16,
    color: '#564141',
    marginTop: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100, // Adjust based on your tab bar height
    right: 25,
    borderRadius: 9999,
    elevation: 3,
    zIndex: 999,
  },

  floatingIcon: {
    width: 60,
    height: 60,
  },
  emptyContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%', // Adjust based on your "Chat" header height
  },
  lottieStyle: {
    width: 200,
    height: 200,
  },
  emptyText: {
    fontSize: 18,
    color: '#510DC0',
    fontFamily: 'Milonga-Regular',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 30, // 👈 Add this. Adjust the number until the gap looks right.
  },
  subText: {
    fontSize: 17,
    color: '#75926bff',
    fontFamily: 'Milonga-Regular',
  },
  spacing: {
    marginTop: '19%',
  },
});

export default Main_screen;
