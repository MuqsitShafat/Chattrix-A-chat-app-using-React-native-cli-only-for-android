import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import LottieView from 'lottie-react-native';

// 1. UPDATED MODULAR IMPORTS
import { getAuth } from '@react-native-firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  writeBatch, 
  doc, 
  serverTimestamp 
} from '@react-native-firebase/firestore';

const Call_screen = ({navigation}) => {
  const {t} = useTranslation();
  const [data, setData] = useState([]); // Start with empty array
  const [loading, setLoading] = useState(true); // Added loading state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

 // 2. INITIALIZE MODULAR INSTANCES
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  // 📡 Real-time listener (Modular Style)
  useEffect(() => {
    if (!user) return;

    // Build the query using modular functions
    const callsQuery = query(
      collection(db, 'calls'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(callsQuery, (querySnapshot) => {
      const calls = [];
      querySnapshot.forEach((documentSnapshot) => {
        calls.push({
          ...documentSnapshot.data(),
          id: documentSnapshot.id,
        });
      });
      setData(calls);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🗑️ Delete logic (Modular Style)
  const deleteSelected = async () => {
    try {
      const batch = writeBatch(db); // Create batch
      
      selectedItems.forEach(itemId => {
        const docRef = doc(db, 'calls', itemId);
        batch.delete(docRef);
      });

      await batch.commit();
      setSelectedItems([]);
      setSelectionMode(false);
    } catch (error) {
      console.error("Delete failed: ", error);
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

  // Hardware Back Button Handler
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

  if (loading) return null; // Or a small activity indicator

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
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

      {/* 🎰 AUTOMATIC TOGGLE: List vs Lottie */}
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../assets/animations/phone_history.json')}
            autoPlay
            loop
            style={styles.lottieStyle}
          />
          <Text style={styles.emptyText}>No call history found</Text>
          <Text style={styles.subText}>Your recent calls will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({item}) => {
            const isSelected = selectedItems.includes(item.id);
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
                    <Text
                      style={styles.userName}
                      numberOfLines={1}
                      adjustsFontSizeToFit>
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Icon name="call-outline" size={30} color="#4175DF" />
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
    paddingBottom: 100, // Extra space for TabBar
  },
  flatlist_container: {
    backgroundColor: '#D3E2F8',
    borderRadius: 20,
    padding: '5%',
    marginBottom: '5%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {flex: 1},
  iconContainer: {flex: 1, alignItems: 'center'},
  timeContainer: {flex: 1, alignItems: 'flex-end'},
  userName: {fontSize: 25, color: 'black', fontFamily: 'IrishGrover-Regular'},
  user_time: {fontSize: 20, color: 'black', fontFamily: 'IrishGrover-Regular'},
  select_all: {fontSize: 20, color: 'white', fontFamily: 'IrishGrover-Regular'},
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
    fontFamily: 'IrishGrover-Regular',
    marginTop: 5,
  },
});

export default Call_screen;
