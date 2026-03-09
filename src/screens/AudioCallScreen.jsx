import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getFirestore} from '@react-native-firebase/firestore';
import {requestCallPermissions} from '../components/permissions';
import {
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
  RTCPeerConnection,
} from 'react-native-webrtc';
import {AuthContext} from '../Auth/AuthContext';
import InCallManager from 'react-native-incall-manager';
import {getSocket} from '../services/socketService';

const AudioCallScreen = ({route, myId, onMinimize, showVideoAlert}) => {
  const db = getFirestore();
  const {
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    pc,
    isMuted,
    toggleMute,
    isVideoOn,
    toggleVideo,
    callDuration,
    setCallStatus,
    setActiveCall,
    isFrontCamera,
    setIsFrontCamera,
    isRemoteFrontCamera,
    setIsRemoteFrontCamera,
    setIsMuted,
    setIsVideoOn,
    startCallTimer,
    stopCallTimer,
    callInitialized,
    triggerHangup, // ✅
    isHangingUp, // ✅ Global hangup lock
  } = useContext(AuthContext);

  const callData = route?.params;
  console.log('🎬 AudioCallScreen callData.callerPic:', callData?.callerPic); // ADD
  const isCaller = callData?.callerId === myId;
  const otherUserId = isCaller ? callData?.receiverId : callData?.callerId;
  const aliasName = isCaller ? callData?.receiverName : callData?.callerName;

  // ✅ Always show the OTHER person's pic in center
  // Caller sees receiver's pic, Receiver sees caller's pic
  const rawProfilePic = isCaller ? callData?.receiverPic : callData?.callerPic;

  // ✅ Fix Google/Facebook URL for high quality
  let photoUrl = rawProfilePic;
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

 const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callConnected, setCallConnected] = useState(false);

  const iceCandidatesQueue = useRef([]);

  const handleToggleMute = () => toggleMute(!isMuted);

 const handleToggleVideo = () => {
    const newVideoState = !isVideoOn;
    toggleVideo(newVideoState);
    // ✅ Just notify other side their friend's video state changed
    // Other side uses this ONLY to show/hide remote video — no alert, no accept/decline
    getSocket()?.emit('videoStateChanged', {
      to: otherUserId,
      isVideoOn: newVideoState,
    });
  };

  const processIceQueue = () => {
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      pc.current
        ?.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.log('Queued ICE error:', e));
    }
  };

  const setupPeerConnection = stream => {
    if (pc.current) pc.current.close();

    pc.current = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
      ],
    });

    stream.getTracks().forEach(track => {
      pc.current.addTrack(track, stream);
    });

    pc.current.ontrack = event => {
      if (event.streams?.[0]) setRemoteStream(event.streams[0]);
    };

    pc.current.onicecandidate = event => {
      if (event.candidate) {
        getSocket()?.emit('ICEcandidate', {
          calleeId: otherUserId,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      }
    };

    pc.current.onconnectionstatechange = () => {
      console.log('PC State:', pc.current?.connectionState);
    };
  };

  // ✅ Only reset state on FIRST mount (new call), not on remount from minimize
  useEffect(() => {
    if (!callInitialized.current) {
      setIsMuted(false);
      setIsVideoOn(false);
      setIsFrontCamera(true);
      setIsRemoteFrontCamera(false);
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !callData) return;

    // ✅ Re-attach socket listeners every time screen mounts (needed after minimize/restore)
  socket.off('callAnswered');
    socket.off('ICEcandidate');
    socket.off('cameraSwitch');
    socket.off('videoStateChanged');  

    socket.on('callAnswered', async data => {
      if (pc.current && !pc.current.remoteDescription) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(data.rtcMessage),
        );
        processIceQueue();
        setCallConnected(true);
      }
    });

    socket.on('ICEcandidate', data => {
      const msg = data.rtcMessage;
      if (msg?.candidate) {
        const candidate = {
          candidate: msg.candidate,
          sdpMLineIndex: msg.label,
          sdpMid: msg.id,
        };
        if (pc.current?.remoteDescription) {
          pc.current
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.log('ICE error:', e));
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      }
    });

    socket.on('cameraSwitch', data => {
      setIsRemoteFrontCamera(data.isFrontCamera);
    });

    // socket.on('videoToggle', data => {
    //   if (data.isVideoOn) {
    //     // Other user wants to START video — show alert
    //     Alert.alert('Video Call Request', `${aliasName} wants to start video`, [
    //       {
    //         text: 'Decline',
    //         style: 'cancel',
    //         onPress: () => {
    //           getSocket()?.emit('videoToggleResponse', {
    //             to: otherUserId,
    //             accepted: false,
    //           });
    //         },
    //       },
    //       {
    //         text: 'Accept',
    //         onPress: () => {
    //           toggleVideo(true);
    //           getSocket()?.emit('videoToggleResponse', {
    //             to: otherUserId,
    //             accepted: true,
    //           });
    //         },
    //       },
    //     ]);
    //   }
    //   // ✅ If other user turned OFF their video — do NOT mirror it, their screen handles itself
    //   // Only respond to turn-ON requests via alert
    // });

    // socket.on('videoToggleResponse', data => {
    //   if (data.accepted) {
    //     toggleVideo(true); // ✅ They accepted — turn on OUR video
    //   } else {
    //     Alert.alert('Video Declined', `${aliasName} declined the video call`);
    //     toggleVideo(false); // ✅ They declined — turn off our request
    //   }
    // });


    //!videostatechanged is the new single event for both ON and OFF — no accept/decline, just notify and update UI
    socket.on('videoStateChanged', data => {
      // ✅ Other person toggled their video — just track their state
      // Their RTCView shows/hides based on remoteStream which updates automatically
      // We only need to know if remote is sending video to show/hide their feed
      setIsRemoteFrontCamera(prev => prev); // trigger re-render if needed
      // No alert, no accept — their video just appears or disappears naturally
    });
    // ✅ KEY FIX: Only run startCall ONCE per real call session
    if (callInitialized.current) {
      console.log('🔁 AudioCallScreen remounted — skipping re-init');
      // If remoteStream already exists, mark as connected (timer already running in context)
      if (remoteStream) setCallConnected(true);
      return () => {
        socket.off('callAnswered');
        socket.off('ICEcandidate');
        socket.off('cameraSwitch');
        socket.off('videoToggle');
        socket.off('videoToggleResponse');
      };
    }

    callInitialized.current = true; // ✅ Mark as initialized

    const startCall = async () => {
      const allowed = await requestCallPermissions();
      if (!allowed) return;

      InCallManager.start({media: 'audio', auto: true, ringback: ''});
      InCallManager.setKeepScreenOn(true);
      InCallManager.setSpeakerphoneOn(false);
      InCallManager.setForceSpeakerphoneOn(false);

      try {
        const stream = await mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {facingMode: 'user', width: 640, height: 480},
        });

        stream.getAudioTracks().forEach(t => (t.enabled = true));
        stream.getVideoTracks().forEach(t => (t.enabled = false));

        setLocalStream(stream);
        setupPeerConnection(stream);

        if (isCaller) {
          const offer = await pc.current.createOffer();
          if (!pc.current) return; // ✅ Aborted during createOffer
          await pc.current.setLocalDescription(offer);
          if (!pc.current) return; // ✅ Aborted during setLocalDescription
          socket.emit('call', {
            calleeId: otherUserId,
            callerId: myId,
            callerName: callData.callerName,
            callerPic: callData.callerPic || '',
            receiverId: otherUserId,
            receiverName: callData.receiverName,
            receiverPic: callData.receiverPic,
            rtcMessage: offer,
          });
} else {
          if (callData.rtcMessage) {
            await pc.current.setRemoteDescription(
              new RTCSessionDescription(callData.rtcMessage),
            );
            if (!pc.current) return; // ✅ Aborted during setRemoteDescription
            processIceQueue();
            const answer = await pc.current.createAnswer();
            if (!pc.current) return; // ✅ Aborted during createAnswer
            await pc.current.setLocalDescription(answer);
            if (!pc.current) return; // ✅ Aborted during setLocalDescription
            socket.emit('answerCall', {
              callerId: otherUserId,
              rtcMessage: answer,
            });
          }
        }
      } catch (e) {
        console.error('Call setup error:', e);
      }
    };

    startCall();
return () => {
      socket.off('callAnswered');
      socket.off('ICEcandidate');
      socket.off('cameraSwitch');
      socket.off('videoStateChanged');
    };
  }, []);

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => (t.enabled = !isMuted));
      localStream.getVideoTracks().forEach(t => (t.enabled = isVideoOn));
    }
    if (isVideoOn) {
      InCallManager.start({media: 'video'});
      InCallManager.setSpeakerphoneOn(true);
    } else {
      InCallManager.start({media: 'audio'});
      InCallManager.setSpeakerphoneOn(isSpeakerOn);
    }
  }, [isMuted, isVideoOn, localStream]);

  useEffect(() => {
    if (!isVideoOn) {
      InCallManager.setSpeakerphoneOn(isSpeakerOn);
    }
  }, [isSpeakerOn]);

  // ✅ Only start timer once — if it's already running (timerRef has value), skip
  useEffect(() => {
    if (remoteStream) {
      setCallConnected(true);
      startCallTimer(); // ✅ Safe now — context guards against double-start
    }
  }, [remoteStream]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSwitchCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => t._switchCamera());
    const newIsFront = !isFrontCamera;
    setIsFrontCamera(newIsFront);
    getSocket()?.emit('cameraSwitch', {
      to: otherUserId,
      isFrontCamera: newIsFront,
    });
  };

  const leaveCall = (shouldEmit = true) => {
    if (isHangingUp.current) return; // ✅ Global lock — reject duplicate presses

    if (shouldEmit) {
      getSocket()?.emit('endCall', {to: otherUserId});
    }

    iceCandidatesQueue.current = [];
    triggerHangup(callData); // ✅ safeHangup sets the lock before cleanupCall runs
  };

  const getStatusText = () => {
    if (isHangingUp.current) return 'Goodbye...';
    if (remoteStream) return formatTime(callDuration);
    if (isCaller) return callConnected ? 'Ringing...' : 'Calling...';
    return 'Connecting...';
  };

  return (
    <View style={styles.container}>
      {remoteStream && isVideoOn ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          mirror={isRemoteFrontCamera}
        />
      ) : (
        <View style={styles.audioBackground} />
      )}

      {localStream && isVideoOn && (
        <View style={styles.localVideoContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            zOrder={1}
            mirror={isFrontCamera}
          />
        </View>
      )}

      {remoteStream && !isVideoOn && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{width: 1, height: 1, position: 'absolute', opacity: 0}}
        />
      )}

      {isVideoOn && (
        <SafeAreaView style={styles.videoHangupContainer}>
          <TouchableOpacity
            style={[
              styles.videoHangupBtn,
              isHangingUp.current && {opacity: 0.5},
            ]}
            onPress={() => leaveCall(true)}
            disabled={isHangingUp.current}>
            <MaterialIcons name="call-end" size={28} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <SafeAreaView style={styles.topOverlay}>
        <Text style={styles.nameText}>{aliasName}</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </SafeAreaView>

      {/* ✅ Shows other person's pic — caller sees receiver, receiver sees caller */}
      {!isVideoOn && (
        <View style={styles.centerArea}>
          <View style={styles.imageContainer}>
            <Image
              source={displayImage}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <ControlBtn
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          active={isSpeakerOn}
          icon={isSpeakerOn ? 'volume-high' : 'volume-high-outline'}
          label="Speaker"
        />
        <ControlBtn
          onPress={handleToggleVideo}
          active={isVideoOn}
          icon={isVideoOn ? 'videocam' : 'videocam-outline'}
          label="Video"
        />
        <ControlBtn
          onPress={handleToggleMute}
          active={isMuted}
          icon={isMuted ? 'mic-off' : 'mic-outline'}
          label="Mute"
        />
        {isVideoOn && (
          <ControlBtn
            onPress={handleSwitchCamera}
            icon="camera-reverse-outline"
            label="Flip"
          />
        )}
        <ControlBtn
          onPress={onMinimize}
          icon="fullscreen-exit"
          label="Minimize"
          isMaterial
        />
        {!isVideoOn && (
          <TouchableOpacity
            style={[
              styles.iconBtnContainer,
              isHangingUp.current && {opacity: 0.5},
            ]}
            onPress={() => leaveCall(true)}
            disabled={isHangingUp.current} // ✅ Globally disabled after first press
            activeOpacity={0.7}>
            <View style={styles.hangupBtn}>
              <MaterialIcons name="call-end" size={30} color="white" />
            </View>
            <Text style={styles.btnLabel}>
              {isHangingUp.current ? 'Goodbye' : 'End'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ControlBtn = ({onPress, active, icon, label, isMaterial}) => (
  <TouchableOpacity style={styles.iconBtnContainer} onPress={onPress}>
    <View style={[styles.iconBtn, active && styles.activeBtn]}>
      {isMaterial ? (
        <MaterialIcons
          name={icon}
          size={26}
          color={active ? 'black' : 'white'}
        />
      ) : (
        <Ionicons name={icon} size={26} color={active ? 'black' : 'white'} />
      )}
    </View>
    <Text style={styles.btnLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#1a1a1a'},
  audioBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 10,
  },
  nameText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 4,
  },
  statusText: {
    fontSize: 18,
    color: '#ddd',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 4,
  },
  videoHangupContainer: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 20,
  },
  videoHangupBtn: {
    marginTop: 60,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 100,
    height: 150,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 15,
    zIndex: 15,
  },
  localVideo: {width: '100%', height: '100%'},
  centerArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#555',
  },
  profileImage: {width: '100%', height: '100%'},
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 10,
  },
  iconBtnContainer: {alignItems: 'center', width: 70},
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(80,80,80,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {backgroundColor: 'white'},
  hangupBtn: {
    backgroundColor: '#ff3b30',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    color: 'white',
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
});

export default AudioCallScreen;
