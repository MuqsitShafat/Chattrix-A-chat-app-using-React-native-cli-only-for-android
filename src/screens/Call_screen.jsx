import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {BackHandler} from 'react-native';

const users = [
  {name: 'ahmed_ali', time: 'time_8am'},
  {name: 'fatima_zahra', time: 'time_8am'},
  {name: 'hassan_raza', time: 'time_8am'},
  {name: 'muqsit', time: 'time_8am'},
  {name: 'naqi', time: 'time_8am'},
  {name: 'mustafa', time: 'time_8am'},
  {name: 'hassan_raza', time: 'time_8am'},
];

const Call_screen = ({navigation}) => {
  const {t} = useTranslation();

  /* 🔹 ADDED STATE (only for feature) */
  const [data, setData] = useState(users);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  /* 🔹 ADDED FUNCTIONS */
  const onLongPressItem = index => {
    setSelectionMode(true);
    setSelectedItems([index]);
  };

  const onPressItem = index => {
    if (!selectionMode) return;

    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const deleteSelected = () => {
    const newData = data.filter((_, index) => !selectedItems.includes(index));
    setData(newData);
    setSelectedItems([]);
    setSelectionMode(false);
  };

  const selectAll = () => {
    setSelectedItems(data.map((_, index) => index));
  };
  useEffect(() => {
    const backAction = () => {
      if (selectionMode) {
        setSelectionMode(false);
        setSelectedItems([]);
        return true; // ⛔ stop app from closing
      }
      return false; // ✅ normal back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [selectionMode, selectedItems]);
  return (
    <View style={styles.container}>
      {/* 🔹 TOP BAR UPDATED (ONLY LOGIC) */}
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

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          paddingHorizontal: '8%',
          paddingTop: '5%',
          paddingBottom: '5%',
        }}
        renderItem={({item, index}) => {
          const isSelected = selectedItems.includes(index);

          return (
            <TouchableOpacity
              onLongPress={() => onLongPressItem(index)}
              onPress={() => onPressItem(index)}
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
                    {t(item.name)}
                  </Text>
                </View>

                <View style={styles.iconContainer}>
                  <TouchableOpacity>
                    <Icon name="call-outline" size={30} color="#4175DF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.timeContainer}>
                  <Text style={styles.user_time}>{t(item.time)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

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
    marginBottom: '4%',
  },
  chat_text: {
    fontSize: 80,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
    marginBottom: '4%',
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
  userName: {
    fontSize: 25,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  user_time: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'IrishGrover-Regular',
  },
  select_all: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
  },
  spacing: {marginTop: '19%'},
});

export default Call_screen;
