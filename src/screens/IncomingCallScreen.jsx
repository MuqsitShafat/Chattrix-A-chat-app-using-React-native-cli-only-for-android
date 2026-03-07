import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const IncomingCallScreen = ({callData, onAccept, onReject}) => {
  const callerName = callData?.callerName || 'Unknown';
  const rawPic = callData?.callerPic || callData?.profilePic || null;

  // ✅ High quality Google/Facebook profile pic
  let photoUrl = rawPic;
  if (photoUrl && typeof photoUrl === 'string') {
    if (photoUrl.includes('googleusercontent.com')) {
      photoUrl = photoUrl.replace('s96-c', 's400-c');
    } else if (photoUrl.includes('facebook.com')) {
      photoUrl = `${photoUrl}?type=large`;
    }
  }

  const displayImage =
    photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== ''
      ? {uri: photoUrl}
      : require('../images/User_profile_icon.jpg');
      

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.incomingText}>Incoming Call</Text>
        <Text style={styles.nameText}>{callerName}</Text>
      </View>

      <View style={styles.centerSection}>
        <View style={styles.imageCircle}>
          <Image
            source={displayImage}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        {/* Reject */}
        <View style={styles.btnWrapper}>
          <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
            <MaterialIcons name="call-end" size={35} color="white" />
          </TouchableOpacity>
          <Text style={styles.btnLabel}>Decline</Text>
        </View>

        {/* Accept */}
        <View style={styles.btnWrapper}>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <MaterialIcons name="call" size={35} color="white" />
          </TouchableOpacity>
          <Text style={styles.btnLabel}>Accept</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  topSection: {alignItems: 'center', marginTop: 20},
  incomingText: {fontSize: 18, color: '#aaa', marginBottom: 10},
  nameText: {fontSize: 36, color: 'white', fontWeight: 'bold'},
  centerSection: {alignItems: 'center', justifyContent: 'center'},
  imageCircle: {
        width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#555',
  },
  profileImage: {width: '100%', height: '100%'},
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    marginBottom: 20,
  },
  btnWrapper: {alignItems: 'center'},
  rejectBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#34c759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {color: 'white', marginTop: 8, fontSize: 14},
});

export default IncomingCallScreen;