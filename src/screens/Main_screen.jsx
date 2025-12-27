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
  updateDoc,
  getDocs,
  deleteDoc,
  writeBatch,
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
  TextInput,
  Alert,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import LottieView from 'lottie-react-native';

const Main_screen = ({navigation}) => {
  const {t} = useTranslation();
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isSearching, setIsSearching] = useState(false); 

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const backAction = () => {
      if (isSearching) {
        setIsSearching(false);
        setSearchQuery(''); 
        return true; 
      }
      return false; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isSearching]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const contactsRef = collection(db, 'users', user.uid, 'contacts');
    const q = query(contactsRef, orderBy('addedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        const friends = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          friends.push({
            ...data,
            id: doc.id,
            displayImage:
              data.profilePic && data.profilePic !== ''
                ? {uri: data.profilePic}
                : require('../images/User_profile_icon.jpg'),
          });
        });
        setDynamicUsers(friends);
      },
      error => {
        console.error('Error fetching contacts:', error);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleLongPress = (contactId, contactName) => {
    Alert.alert(
      t('delete_chat'),
      `${t('delete_chat_confirm', {name: contactName})}`,
      [
        {text: t('cancel'), style: 'cancel'},
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              
              const sortedIds = [user.uid, contactId].sort();
              const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
              
              const messagesRef = collection(db, 'chats', chatId, 'messages');
              const querySnapshot = await getDocs(messagesRef);
              const batch = writeBatch(db);

              querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
              });
              await batch.commit();

              await updateDoc(doc(db, 'users', user.uid, 'contacts', contactId), {
                chatHidden: true,
                lastMessage: '',
              });

              console.log('Chat messages deleted and contact hidden');
            } catch (error) {
              console.error('Error deleting chat messages:', error);
              Alert.alert(t('permission_error'), t('firebase_rules_error'));
            }
          },
        },
      ],
    );
  };

  // Logic to filter users
  const filteredUsers = dynamicUsers.filter(user => {
    const matchesSearch = user.aliasName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (isSearching && searchQuery.length > 0) {
      // While searching: show users that match the text (including hidden ones so they can be found again)
      return matchesSearch;
    } else {
      // Normal view: Only show active, non-hidden chats
      return !user.chatHidden;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={45} color="red" />
        </TouchableOpacity>

        {isSearching ? (
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            onBlur={() => {
              if (searchQuery === '') {
                setIsSearching(false);
                setSearchQuery('');
              }
            }}
          />
        ) : null}

        <TouchableOpacity
          onPress={() => {
            if (isSearching) {
              setSearchQuery('');
            }
            setIsSearching(!isSearching);
          }}>
          <Image source={require('../images/Frame2.png')} />
        </TouchableOpacity>
      </View>

      <View style={styles.circle}></View>

      <View style={styles.chat_text_view}>
        <Text style={styles.chat_text}>{t('chat')}</Text>
      </View>

      {/* CASE 1: User has NO contacts at all in Database */}
      {dynamicUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../assets/animations/empty_list.json')}
            autoPlay
            loop
            style={styles.lottieStyle}
          />
          <Text style={styles.emptyText}>
            {t('connect_friends')}
            {'\n'}
            <Text style={styles.subText}>{t('hit_add_button')}</Text>
          </Text>
        </View>
      ) : /* CASE 2: User is searching but typed something that doesn't exist */
      isSearching && searchQuery.length > 0 && filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('no_contact_found')}</Text>
          <LottieView
            source={require('../assets/animations/no_contact_found.json')}
            autoPlay
            loop
            style={[styles.lottieStyle, {width: 250, height: 250}]}
          />
        </View>
      ) : /* CASE 3: User has contacts but ALL of them are hidden (deleted chats) */
      !isSearching && filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../assets/animations/no_active_list.json')}
            autoPlay
            loop
            style={styles.lottieStyle}
          />
          <Text style={styles.emptyText}>
            {t('no_active_chats')}
            {'\n'}
            <Text style={styles.subText}>{t('start_conversation_hint')}</Text>
          </Text>
        </View>
      ) : (
        /* CASE 4: The actual List */
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingHorizontal: '8%', paddingTop: '10%'}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.flatlist_container}
              onLongPress={() => handleLongPress(item.id, item.aliasName)}
              onPress={async () => {
                if (item.chatHidden) {
                    const user = auth.currentUser;
                    await updateDoc(doc(db, 'users', user.uid, 'contacts', item.id), {
                        chatHidden: false,
                    });
                }
                navigation.navigate('Chat', {
                  friendId: item.friendId,
                  friendName: item.aliasName,
                })
              }}>
              <Image source={item.displayImage} style={styles.profileImage} />
              <View style={styles.chatContent}>
                <Text style={styles.userName}>{item.aliasName}</Text>
                <Text style={styles.userMessage}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    color: 'black',
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
    bottom: 100,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%',
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
    lineHeight: 30,
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
