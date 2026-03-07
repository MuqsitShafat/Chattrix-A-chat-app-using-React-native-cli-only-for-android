
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import React, {useEffect, useState, useRef, useContext} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import LottieView from 'lottie-react-native';
import {getAuth} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  getDoc,
} from '@react-native-firebase/firestore';
import {AuthContext} from '../Auth/AuthContext';
import {getSocket} from '../services/socketService';

const Call_screen = ({navigation}) => {
  const {t} = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const {activeCall, setActiveCall} = useContext(AuthContext);

  const isMounted = useRef(true);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    isMounted.current = true;
    if (!user) return;

    const callsQuery = query(
      collection(db, 'call_history'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
    );

    const unsubscribe = onSnapshot(
      callsQuery,
      async querySnapshot => {
        if (!isMounted.current) return;

        const promises = querySnapshot.docs.map(async documentSnapshot => {
          const callData = documentSnapshot.data();

          let readableTime = '';
          if (callData.timestamp) {
            const date = callData.timestamp.toDate();
            readableTime = date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
          }

          let displayName = 'Unknown';
          let displayPic = ''; // ✅ FIX: fetch pic
          try {
            const contactRef = doc(
              db,
              'users',
              user.uid,
              'contacts',
              callData.friendId,
            );
            const contactSnap = await getDoc(contactRef);

            if (contactSnap.exists()) {
              displayName =
                contactSnap.data().aliasName ||
                contactSnap.data().originalName ||
                'User';
              displayPic = contactSnap.data().profilePic || '';
            } else {
              const userRef = doc(db, 'users', callData.friendId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                displayName = userSnap.data().name || 'User';
                displayPic = userSnap.data().profilePic || ''; // ✅ fetch from users collection
              }
            }
          } catch (e) {
            console.log('Error fetching name:', e);
          }

          return {
            ...callData,
            id: documentSnapshot.id,
            name: displayName,
            pic: displayPic, // ✅ store pic
            time: readableTime,
          };
        });

        const resolvedCalls = await Promise.all(promises);
        if (isMounted.current) {
          setData(resolvedCalls);
          setLoading(false);
        }
      },
      error => {
        setLoading(false);
      },
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [user]);

  // ✅ FIX: pass friendPic into setActiveCall so caller sees receiver's image
  const handleHistoryCall = (friendId, friendName, friendPic) => {
    if (!friendId || !user || activeCall) return;

    const socket = getSocket();
    if (!socket) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    Alert.alert('Start Call', `Do you want to call ${friendName}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Call',
        onPress: () => {
          setActiveCall({
            callerId: user.uid,
            callerName: user.displayName || 'User',
            callerPic: user.photoURL || '',
            receiverId: friendId,
            receiverName: friendName,
            receiverPic: friendPic || '', // ✅ now correctly set
            isIncoming: false,
          });
        },
      },
    ]);
  };

  const deleteSelected = async () => {
    try {
      const batch = writeBatch(db);
      selectedItems.forEach(itemId => {
        const docRef = doc(db, 'call_history', itemId);
        batch.delete(docRef);
      });
      await batch.commit();
      setSelectedItems([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Delete failed: ', error);
    }
  };

  const onLongPressItem = id => {
    setSelectionMode(true);
    setSelectedItems([id]);
  };

  const onPressItem = id => {
    if (!selectionMode) return;
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const selectAll = () => {
    setSelectedItems(data.map(item => item.id));
  };

  useEffect(() => {
    const backAction = () => {
      if (selectionMode) {
        setSelectionMode(false);
        setSelectedItems([]);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [selectionMode]);

  if (loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {selectionMode ? (
          <>
            <TouchableOpacity
              onPress={() => {
                setSelectionMode(false);
                setSelectedItems([]);
              }}>
              <Icon name="close" size={35} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={selectAll}>
              <Text style={styles.select_all}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteSelected}>
              <Icon name="trash" size={30} color="red" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" size={45} color="red" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../images/Frame2.png')} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.circle}></View>

      <View style={styles.chat_text_view}>
        <Text style={styles.chat_text}>{t('call')}</Text>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../assets/animations/phone_history.json')}
            autoPlay
            loop
            style={styles.lottieStyle}
          />
          <Text style={styles.emptyText}>No call history found</Text>
          <Text style={styles.subText}>
            Make calls to see your call history here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({item}) => {
            const isSelected = selectedItems.includes(item.id);
            const isOutbound = item.type === 'outbound' || item.type === 'missed_outbound';
            const isMissed = item.type === 'missed_outbound' || item.type === 'missed_inbound';
            return (
              <TouchableOpacity
                onLongPress={() => onLongPressItem(item.id)}
                onPress={() => onPressItem(item.id)}
                activeOpacity={0.8}>
                <View
                  style={[
                    styles.flatlist_container,
                    isSelected && {backgroundColor: '#8BB3FF'},
                  ]}>
                  {selectionMode && (
                    <Icon
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={25}
                      style={{marginRight: 10}}
                    />
                  )}

                  <View style={styles.nameContainer}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon
                        name={
                          isMissed
                            ? 'call-outline'
                            : isOutbound
                            ? 'arrow-up-outline'
                            : 'arrow-down-outline'
                        }
                        size={14}
                        color={
                          isMissed ? '#FF9500' : isOutbound ? '#4CD964' : '#FF3B30'
                        }
                        style={[styles.tiltedArrow,  isMissed && {transform: [{rotate: '360deg'}]},]}
                      />
                      <Text
                        style={[
                          styles.directionText,
                          isMissed && {color: '#FF9500',},
                          
                        ]}>
                        {isMissed
                          ? isOutbound
                            ? 'Missed (you)'
                            : 'Missed'
                          : isOutbound
                          ? 'Outbound'
                          : 'Inbound'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={
                        () =>
                          handleHistoryCall(item.friendId, item.name, item.pic) // ✅ pass pic
                      }
                      disabled={!!activeCall}
                      style={activeCall && {opacity: 0.6}}>
                      <Icon
                        name="call-outline"
                        size={30}
                        color={activeCall ? '#878787' : '#4175DF'}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeContainer}>
                    <Text style={styles.user_time}>{item.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <View style={styles.spacing}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: StatusBar.currentHeight,
    zIndex: 5,
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
    marginBottom: '4%',
  },
  chat_text: {
    fontSize: 80,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  listPadding: {
    paddingHorizontal: '8%',
    paddingTop: '5%',
    paddingBottom: 100,
  },
  flatlist_container: {
    backgroundColor: '#D3E2F8',
    borderRadius: 20,
    padding: '5%',
    marginBottom: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {flex: 1.5},
  iconContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  timeContainer: {flex: 1.5, alignItems: 'flex-end'},
  userName: {fontSize: 22, color: 'black', fontFamily: 'IrishGrover-Regular'},
  user_time: {fontSize: 18, color: 'black', fontFamily: 'IrishGrover-Regular'},
  select_all: {fontSize: 20, color: 'white', fontFamily: 'IrishGrover-Regular'},
  directionText: {fontSize: 12, color: 'gray', marginLeft: 4},
  tiltedArrow: {transform: [{rotate: '45deg'}]},
  spacing: {marginTop: '19%'},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  lottieStyle: {width: 250, height: 250},
  emptyText: {
    fontSize: 22,
    color: '#510DC0',
    fontFamily: 'IrishGrover-Regular',
    marginTop: 10,
  },
  subText: {
    fontSize: 16,
    color: '#75926bff',
    fontFamily: 'Milonga-Regular',
    marginTop: 5,
  },
});

export default Call_screen;
