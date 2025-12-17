import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
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
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{paddingHorizontal: '8%', paddingTop: '10%'}}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.flatlist_container}
            onPress={() => navigation.navigate('Chat')}>
            <Image source={item.image} style={styles.profileImage} />
            <View style={styles.chatContent}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userMessage}>{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Floating Add Contact Button */}
      <TouchableOpacity style={styles.floatingButton}   onPress={() => navigation.navigate('Add_Contact')}>
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
  spacing: {
    marginTop: '19%',
  },
});

export default Main_screen;
