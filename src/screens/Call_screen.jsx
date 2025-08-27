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
const users = [
  {
    name: 'Ahmed Ali',
    time: '8:00 am',
  },
  {
    name: 'Fatima Zahra',
    time: '8:00 am',
  },
  {
    name: 'Hassan Raza',
    time: '8:00 am',
  },
  {
    name: 'Muqsit',
    time: '8:00 am',
  },
  {
    name: 'Naqi',
    time: '8:00 am',
  },
  {
    name: 'Mustafa',
    time: '8:00 am',
  },
  {
    name: 'Hassan Raza',
    time: '8:00 am',
  },
];
const Call_screen = ({navigation}) => {
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
        <Text style={styles.chat_text}>Call</Text>
      </View>

      {/* Call list of users with name and call image in the middle and time on the right side */}
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          paddingHorizontal: '8%',
          paddingTop: '5%',
          paddingBottom: '5%',
        }}
        renderItem={({item}) => (
          <View style={styles.flatlist_container}>
            <View style={styles.nameContainer}>
              <Text
                style={styles.userName}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {item.name}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <TouchableOpacity>
                <Icon name="call-outline" size={30} color="#4175DF" />
              </TouchableOpacity>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.user_time}>{item.time}</Text>
            </View>
          </View>
        )}
      />
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

  nameContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },

  timeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },

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
  spacing: {
    marginTop: '19%',
  },
});

export default Call_screen;
