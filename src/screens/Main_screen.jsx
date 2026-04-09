import React, {useState, useEffect} from 'react';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  getDocs,
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
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import LottieView from 'lottie-react-native';

const Main_screen = ({navigation}) => {
  const {t} = useTranslation();
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const [messageTimestamps, setMessageTimestamps] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const db = getFirestore();
  const auth = getAuth();

  const formatTimeAgo = timestamp => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

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
    const unsubscribe = onSnapshot(q, querySnapshot => {
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
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || dynamicUsers.length === 0) return;
    const unsubscribes = dynamicUsers.map(friend => {
      const chatId = [user.uid, friend.friendId].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      return onSnapshot(q, querySnapshot => {
        const allMsgs = querySnapshot.docs.map(d => ({...d.data(), id: d.id}));
        const latestValidMsg = allMsgs.find(
          msg => !msg.deletedBy || !msg.deletedBy.includes(user.uid),
        );
        let displayLastMsg = 'No messages yet. Say Hi! 👋';
        let timestamp = friend.addedAt ? friend.addedAt.toMillis() : 0;
        let unread = 0;

        allMsgs.forEach(msg => {
          if (
            msg.senderId === friend.friendId &&
            msg.status !== 'read' &&
            (!msg.deletedBy || !msg.deletedBy.includes(user.uid))
          ) {
            unread++;
          }
        });

        if (latestValidMsg) {
          displayLastMsg = latestValidMsg.isDeleted
            ? '🚫 This message was deleted'
            : latestValidMsg.text;
          if (latestValidMsg.createdAt) {
            timestamp = latestValidMsg.createdAt.toMillis();
          }
        }
        setLastMessages(prev => ({...prev, [friend.friendId]: displayLastMsg}));
        setMessageTimestamps(prev => ({...prev, [friend.friendId]: timestamp}));
        setUnreadCounts(prev => ({...prev, [friend.friendId]: unread}));
      });
    });
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [dynamicUsers]);

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
              querySnapshot.forEach(msgDoc => {
                const data = msgDoc.data();
                const docRef = msgDoc.ref;
                if (data.deletedBy && data.deletedBy.includes(contactId)) {
                  batch.delete(docRef);
                } else {
                  batch.update(docRef, {
                    deletedBy: Array.isArray(data.deletedBy)
                      ? [...data.deletedBy, user.uid]
                      : [user.uid],
                  });
                }
              });
              await batch.commit();
              await updateDoc(
                doc(db, 'users', user.uid, 'contacts', contactId),
                {chatHidden: true},
              );
            } catch (error) {
              console.error('Error deleting chat:', error);
            }
          },
        },
      ],
    );
  };
// Filtering logic: on the basis of recent messages
  const filteredUsers = dynamicUsers
    .filter(user => {
      const matchesSearch = user.aliasName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return isSearching && searchQuery.length > 0
        ? matchesSearch
        : !user.chatHidden;
    })
    .sort((a, b) => {
      const timeA = messageTimestamps[a.friendId] || 0;
      const timeB = messageTimestamps[b.friendId] || 0;
      return timeB - timeA;
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={45} color="red" />
        </TouchableOpacity>
        {isSearching && (
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
        )}
        <TouchableOpacity
          onPress={() => {
            if (isSearching) setSearchQuery('');
            setIsSearching(!isSearching);
          }}>
          <Image source={require('../images/Frame2.png')} />
        </TouchableOpacity>
      </View>
      <View style={styles.circle}></View>
      <View style={styles.chat_text_view}>
        <Text style={styles.chat_text}>{t('chat')}</Text>
      </View>
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
      ) : (
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
                  await updateDoc(
                    doc(db, 'users', user.uid, 'contacts', item.id),
                    {chatHidden: false},
                  );
                }
                navigation.navigate('Chat', {
                  friendId: item.friendId,
                  friendName: item.aliasName,
                  profilePic: item.profilePic,
                });
              }}>
              <Image source={item.displayImage} style={styles.profileImage} />
              <View style={styles.chatContent}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.userName}>{item.aliasName}</Text>
                  <Text style={styles.timeAgoText}>
                    {formatTimeAgo(messageTimestamps[item.friendId])}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5}}>
                  <Text style={styles.userMessage} numberOfLines={1}>
                    {lastMessages[item.friendId] || 'Loading...'}
                  </Text>
                  {unreadCounts[item.friendId] > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unreadCounts[item.friendId]}</Text>
                    </View>
                  )}
                </View>
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
    </SafeAreaView>
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
    marginTop: 15, // Fixed padding replacing StatusBar.currentHeight
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
  chat_text_view: {marginTop: '18%', marginLeft: '5%', marginBottom: '3%'},
  chat_text: {fontSize: 80, color: 'black', fontFamily: 'IrishGrover-Regular'},
  flatlist_container: {
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    padding: '4%',
    marginBottom: '5%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {width: 50, height: 50, borderRadius: 25},
  chatContent: {marginLeft: 15, flex: 1},
  userName: {fontSize: 24, fontFamily: 'IrishGrover-Regular', color: '#333'},
  userMessage: {fontSize: 16, color: '#564141', flex: 1, paddingRight: 10},
  timeAgoText: {fontSize: 12, color: '#202b9e72', fontFamily: 'Milonga-Regular'},
  unreadBadge: {
    backgroundColor: '#510DC0',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 25,
    borderRadius: 9999,
    elevation: 3,
    zIndex: 999,
  },
  floatingIcon: {width: 60, height: 60},
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%',
  },
  lottieStyle: {width: 200, height: 200},
  emptyText: {
    fontSize: 18,
    color: '#510DC0',
    fontFamily: 'Milonga-Regular',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 30,
  },
  subText: {fontSize: 17, color: '#75926bff', fontFamily: 'Milonga-Regular'},
  spacing: {marginTop: '19%'},
});

export default Main_screen;
