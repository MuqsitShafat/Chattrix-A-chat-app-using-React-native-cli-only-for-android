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
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {pickMedia} from '../components/MediaPicker';
import {getFirestore, doc, onSnapshot} from '@react-native-firebase/firestore';

const Chat_display_screen = ({navigation, route}) => {
  const {friendId, friendName, profilePic} = route.params;
  const [onlineStatus, setOnlineStatus] = useState('Offline');
  const db = getFirestore();

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
          const timeString = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          setOnlineStatus(`Last seen at ${timeString}`);
        } else {
          setOnlineStatus('Offline');
        }
      }
    });

    return () => unsubscribe();
  }, [friendId]);

  const displayImage =
    profilePic && profilePic !== ''
      ? {uri: profilePic}
      : require('../images/User_profile_icon.jpg');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.Content_container}>
        <View style={styles.left_section}>
          <TouchableOpacity
            style={styles.back_arrow}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../images/Frame.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <View style={styles.name_container}>
            <Text style={styles.name}>{friendName}</Text>
            <Text style={styles.online}>{onlineStatus}</Text>
          </View>
        </View>

        <View style={styles.right_section}>
          <TouchableOpacity style={styles.call_icon}>
            <Icon name="call-outline" size={37} color="black" />
          </TouchableOpacity>
          <Image source={displayImage} style={styles.image} />
        </View>
      </View>

      <ScrollView style={styles.chat_area}>
        <View style={styles.message_container}>
          <View style={styles.received_message}>
            <Text style={styles.received_message_text}>
              Hey {friendName}, how's it going?
            </Text>
          </View>

          <View style={styles.sent_message}>
            <Text style={styles.sent_message_text}>
              Hey! I'm doing great, just working on a new app.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.input_wrapper}>
        <View style={styles.Message_container}>
          <View style={styles.input_container}>
            <TextInput
              placeholder="Type a message"
              placeholderTextColor="#A1A1A1"
              style={styles.input}
            />
          </View>
          <View style={styles.send_container}>
            <TouchableOpacity
              style={styles.attach_button}
              onPress={async () => {
                const media = await pickMedia();
                if (media) {
                  console.log('Picked media URI:', media.uri);
                }
              }}>
              <Icon name="attach-outline" size={37} color="black" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.send_button}>
              <Icon name="send-outline" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#510DC0',
  },
  Content_container: {
    flexDirection: 'row',
    backgroundColor: '#635A71',
    height: 90,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
    marginTop: StatusBar.currentHeight,
  },
  left_section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right_section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  back_arrow: {
    marginRight: 20,
  },
  icon: {
    width: 34,
    height: 34,
  },
  name_container: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
  },
  online: {
    fontSize: 14,
    color: '#d1d1d1',
    fontFamily: 'InstrumentSans-Regular',
  },
  call_icon: {
    marginRight: 10,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 999,
    marginLeft: 10,
  },
  chat_area: {
    flex: 1,
    backgroundColor: '#510DC0',
  },
  message_container: {
    padding: 16,
  },
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
  input_wrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: '4%',
  },
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
  input_container: {
    flex: 1,
  },
  input: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'InstrumentSans-Regular',
    marginLeft: 10,
  },
  send_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
});

export default Chat_display_screen;
