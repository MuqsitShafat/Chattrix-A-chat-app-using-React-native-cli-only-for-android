import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  BackHandler,
  Modal,
} from 'react-native';
import React, {useState, useEffect, useContext, useRef} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import {pickMedia} from '../components/MediaPicker';
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
} from '@react-native-firebase/firestore';
import {AuthContext} from '../Auth/AuthContext';

const Chat_display_screen = ({navigation, route}) => {
  const friendId = route?.params?.friendId;
  const friendName = route?.params?.friendName || 'User';
  const initialProfilePic = route?.params?.profilePic;

  const {user} = useContext(AuthContext);
  const [onlineStatus, setOnlineStatus] = useState('Offline');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const db = getFirestore();
  const scrollViewRef = useRef();
  const sendAnim = useRef(new Animated.Value(0)).current;

  const chatId =
    user?.uid && friendId ? [user.uid, friendId].sort().join('_') : null;

  useEffect(() => {
    const backAction = () => {
      if (showProfileModal) {
        setShowProfileModal(false);
        return true;
      }
      if (isSelectionMode) {
        exitSelection();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [isSelectionMode, showProfileModal]);

  useEffect(() => {
    if (!friendId) return;
    const userRef = doc(db, 'users', friendId);
    const unsubscribe = onSnapshot(userRef, documentSnapshot => {
      if (documentSnapshot.exists()) {
        const data = documentSnapshot.data();
        if (data.status === 'online') {
          setOnlineStatus('Online');
        } else if (data.lastSeen) {
          const date = data.lastSeen.toDate();
          setOnlineStatus(
            `Last seen at ${date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`,
          );
        } else {
          setOnlineStatus('Offline');
        }
      }
    });
    return () => unsubscribe();
  }, [friendId]);

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, querySnapshot => {
      const allMessages = querySnapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          if (data.senderId === friendId && data.status !== 'read') {
            updateDoc(docSnap.ref, {status: 'read'});
          }
          return {...data, id: docSnap.id};
        })
        .filter(msg => !msg.deletedBy || !msg.deletedBy.includes(user.uid));
      setMessages(allMessages);
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (messageText.trim().length === 0 || !chatId) return;
    Animated.sequence([
      Animated.timing(sendAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sendAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    const msg = messageText;
    setMessageText('');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: msg,
        senderId: user.uid,
        receiverId: friendId,
        createdAt: serverTimestamp(),
        status: 'sent',
        deletedBy: [],
        isDeleted: false,
      });
      await setDoc(
        doc(db, 'chats', chatId),
        {
          lastMessage: msg,
          lastUpdated: serverTimestamp(),
          users: [user.uid, friendId],
        },
        {merge: true},
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSelection = id => {
    if (selectedMessages.includes(id)) {
      const newList = selectedMessages.filter(item => item !== id);
      setSelectedMessages(newList);
      if (newList.length === 0) setIsSelectionMode(false);
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  const handleLongPress = id => {
    setIsSelectionMode(true);
    toggleSelection(id);
  };

  const deleteSelectedMessages = () => {
    const now = Date.now();
    const limit = 3 * 60 * 1000;
    let timeRemainingStr = '';
    const canDeleteForEveryone = selectedMessages.every(msgId => {
      const msgData = messages.find(m => m.id === msgId);
      if (
        !msgData ||
        msgData.senderId !== user.uid ||
        !msgData.createdAt ||
        msgData.isDeleted
      )
        return false;
      const diff = now - msgData.createdAt.toMillis();
      if (diff < limit) {
        const remainingSecs = Math.floor((limit - diff) / 1000);
        const mins = Math.floor(remainingSecs / 60);
        const secs = remainingSecs % 60;
        timeRemainingStr = `(${mins}m ${secs}s left)`;
        return true;
      }
      return false;
    });

    const alertButtons = [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete for Me',
        style: 'destructive',
        onPress: async () => {
          const batch = writeBatch(db);
          selectedMessages.forEach(msgId => {
            const msgData = messages.find(m => m.id === msgId);
            const docRef = doc(db, 'chats', chatId, 'messages', msgId);
            if (msgData?.deletedBy?.includes(friendId)) {
              batch.delete(docRef);
            } else {
              batch.update(docRef, {deletedBy: arrayUnion(user.uid)});
            }
          });
          await batch.commit();
          exitSelection();
        },
      },
    ];

    if (canDeleteForEveryone) {
      alertButtons.splice(1, 0, {
        text: `Delete for Everyone ${timeRemainingStr}`,
        style: 'destructive',
        onPress: async () => {
          const batch = writeBatch(db);
          selectedMessages.forEach(msgId => {
            const docRef = doc(db, 'chats', chatId, 'messages', msgId);
            batch.update(docRef, {
              text: 'This message was deleted',
              isDeleted: true,
            });
          });
          await batch.commit();
          exitSelection();
        },
      });
    }
    Alert.alert(
      'Delete Messages',
      `Delete ${selectedMessages.length} message(s)?`,
      alertButtons,
    );
  };

  const exitSelection = () => {
    setIsSelectionMode(false);
    setSelectedMessages([]);
  };

  const planeRotation = sendAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });

  let photoUrl = initialProfilePic;
  if (photoUrl && typeof photoUrl === 'string') {
    if (photoUrl.includes('googleusercontent.com')) {
      photoUrl = photoUrl.replace('s96-c', 's400-c');
    } else if (photoUrl.includes('facebook.com')) {
      photoUrl = `${photoUrl}?type=large`;
    }
  }

  const displayImage =
    photoUrl && photoUrl !== ''
      ? {uri: photoUrl}
      : require('../images/User_profile_icon.jpg');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}>
          <View style={styles.darkBackground} />
          <View style={styles.modalImageWrapper}>
            <Image
              source={displayImage}
              style={styles.fullImage}
              resizeMode="cover"
              fadeDuration={0}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <View
        style={[
          styles.Content_container,
          isSelectionMode && {backgroundColor: '#444'},
        ]}>
        <View style={styles.left_section}>
          <TouchableOpacity
            onPress={
              isSelectionMode ? exitSelection : () => navigation.goBack()
            }>
            <Icon
              name={isSelectionMode ? 'close' : 'arrow-back'}
              size={30}
              color="white"
              style={{marginRight: 15}}
            />
          </TouchableOpacity>
          {!isSelectionMode ? (
            <View style={styles.name_container}>
              <Text style={styles.name}>{friendName}</Text>
              <Text style={styles.online}>{onlineStatus}</Text>
            </View>
          ) : (
            <Text style={styles.name}>{selectedMessages.length} selected</Text>
          )}
        </View>
        <View style={styles.right_section}>
          {isSelectionMode ? (
            <TouchableOpacity onPress={deleteSelectedMessages}>
              <Icon name="trash-outline" size={30} color="red" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.call_icon}>
                <Icon name="call-outline" size={37} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowProfileModal(true)}>
                <Image source={displayImage} style={styles.image} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.chat_area}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          !isSelectionMode &&
          scrollViewRef.current?.scrollToEnd({animated: true})
        }>
        {messages.length === 0 ? (
          <View style={{flex: 1, alignItems: 'center', marginTop: 100}}>
            <LottieView
              source={require('../assets/animations/no_contact_found.json')}
              autoPlay
              loop
              style={{width: 250, height: 250}}
            />
            <Text
              style={{
                color: 'white',
                fontFamily: 'IrishGrover-Regular',
                fontSize: 18,
                marginTop: 10,
              }}>
              No messages yet. Say Hi!
            </Text>
          </View>
        ) : (
          <View style={styles.message_container}>
            {messages.map(item => {
              const isSelected = selectedMessages.includes(item.id);
              const isMe = item.senderId === user.uid;
              return (
                <TouchableOpacity
                  key={item.id}
                  onLongPress={() => handleLongPress(item.id)}
                  onPress={() =>
                    isSelectionMode ? toggleSelection(item.id) : null
                  }
                  activeOpacity={0.9}
                  style={[
                    isMe ? styles.sent_message : styles.received_message,
                    isSelected && {backgroundColor: 'rgba(62, 127, 224, 0.5)'},
                    item.isDeleted && {backgroundColor: '#444', opacity: 0.6},
                  ]}>
                  <Text
                    style={[
                      isMe
                        ? styles.sent_message_text
                        : styles.received_message_text,
                      item.isDeleted && {fontStyle: 'italic', color: '#ccc'},
                    ]}>
                    {item.isDeleted ? (
                      <>
                        <Icon name="ban-outline" size={14} /> This message was
                        deleted
                      </>
                    ) : (
                      item.text
                    )}
                  </Text>
                  {isMe && !item.isDeleted && (
                    <View style={{alignSelf: 'flex-end', marginTop: 2}}>
                      <Icon
                        name={
                          item.status === 'read'
                            ? 'checkmark-done'
                            : 'checkmark'
                        }
                        size={16}
                        color={item.status === 'read' ? '#3E7FE0' : '#A1A1A1'}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {!isSelectionMode && (
        <View style={styles.input_wrapper}>
          <View style={styles.Message_container}>
            <View style={styles.input_container}>
              <TextInput
                placeholder="Type a message"
                placeholderTextColor="#A1A1A1"
                style={styles.input}
                value={messageText}
                onChangeText={setMessageText}
              />
            </View>
            <View style={styles.send_container}>
              <TouchableOpacity
                style={styles.attach_button}
                onPress={async () => {
                  const media = await pickMedia();
                  if (media) console.log(media.uri);
                }}>
                <Icon name="attach-outline" size={37} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.send_button}
                onPress={sendMessage}>
                <Animated.View style={{transform: [{rotate: planeRotation}]}}>
                  <Icon name="send-outline" size={25} color="white" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#510DC0'},
  Content_container: {
    flexDirection: 'row',
    backgroundColor: '#635A71',
    height: 90,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
  },
  left_section: {flexDirection: 'row', alignItems: 'center'},
  right_section: {flexDirection: 'row', alignItems: 'center'},
  name_container: {justifyContent: 'center'},
  name: {fontSize: 28, color: 'white', fontFamily: 'Milonga-Regular'},
  online: {
    fontSize: 14,
    color: '#d1d1d1',
    fontFamily: 'InstrumentSans-Regular',
  },
  call_icon: {marginRight: 10},
  image: {width: 45, height: 45, borderRadius: 999, marginLeft: 10},
  chat_area: {flex: 1, backgroundColor: '#510DC0'},
  message_container: {padding: 16},
  received_message: {
    alignSelf: 'flex-start',
    backgroundColor: '#D9D9D9',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  sent_message: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  received_message_text: {
    fontSize: 15,
    color: 'black',
    fontFamily: 'InstrumentSans-Regular',
  },
  sent_message_text: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'InstrumentSans-Regular',
  },
  input_wrapper: {width: '100%', alignItems: 'center', marginBottom: '4%'},
  Message_container: {
    elevation: 10,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 70,
    borderRadius: 50,
    width: '90%',
    alignItems: 'center',
    paddingHorizontal: '4%',
  },
  input_container: {flex: 1},
  input: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'InstrumentSans-Regular',
    marginLeft: 10,
  },
  send_container: {flexDirection: 'row', alignItems: 'center'},
  attach_button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    transform: [{rotate: '40deg'}],
  },
  send_button: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#3E7FE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  darkBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalImageWrapper: {
    width: 320,
    height: 320,
    borderRadius: 99999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'gray',
  },
  fullImage: {width: '100%', height: '100%'},
});

export default Chat_display_screen;
