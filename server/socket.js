const {Server} = require('socket.io');
let IO;

// Helper to securely send Push Notifications
const sendPush = (token, title, body, dataPayload = {}) => {
  if (!token) return;
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined,
        })
      });
    }

    // To reliably trigger the background handler for double-ticks, we send a data-only payload.
    // The notification payload will be handled manually via Notifee.
    const combinedData = {
      ...dataPayload,
      notificationTitle: title || '',
      notificationBody: body || ''
    };

    const payload = {
      token: token,
      data: combinedData,
      android: { priority: 'high' }
    };

    admin.messaging().send(payload)
      .then(response => console.log('Successfully sent data-only notification:', title))
      .catch(error => console.log('Error sending data-only notification:', error));
  } catch (err) {
    console.log('Firebase-admin error:', err.message);
  }
};

module.exports.initIO = httpServer => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on('connection', socket => {
    console.log(socket.user, 'Connected');
    socket.join(socket.user);

    // ✅ Forward ALL call data to receiver
    socket.on('call', data => {
      socket.to(data.calleeId).emit('newCall', {
        callerId: data.callerId,
        callerName: data.callerName,
        callerPic: data.callerPic,
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        receiverPic: data.receiverPic,
        rtcMessage: data.rtcMessage,
      });

      // 🚀 Incoming Call Push Notification
      if (data.token) {
        sendPush(data.token, "Incoming Audio Call", `${data.callerName} is calling you...`, {
          isCall: 'true',
          callerId: String(data.callerId || ''),
          callerName: String(data.callerName || ''),
          callerPic: String(data.callerPic || ''),
          receiverId: String(data.receiverId || ''),
          receiverName: String(data.receiverName || ''),
          receiverPic: String(data.receiverPic || ''),
          rtcMessage: data.rtcMessage ? JSON.stringify(data.rtcMessage) : ''
        });
      }
    });

    socket.on('answerCall', data => {
      socket.to(data.callerId).emit('callAnswered', {
        callee: socket.user,
        rtcMessage: data.rtcMessage,
      });
    });

    socket.on('ICEcandidate', data => {
      socket.to(data.calleeId).emit('ICEcandidate', {
        sender: socket.user,
        rtcMessage: data.rtcMessage,
      });
    });

    // ✅ endCall works at ANY stage — before or during call
    socket.on('endCall', data => {
      socket.to(data.to).emit('remoteHangup');

      // 🚀 Missed Call Push Notification
      if (data.token && data.missed) {
        sendPush(data.token, "Missed Call", `You missed a call from ${data.callerName}`, {
          callerId: String(data.callerId || ''),
          callerName: String(data.callerName || '')
        });
      }
    });

    socket.on('cameraSwitch', data => {
      socket.to(data.to).emit('cameraSwitch', {
        isFrontCamera: data.isFrontCamera,
      });
    });

    socket.on('videoStateChanged', data => {
      // ✅ Just forward — no logic needed, each user controls their own video
      socket.to(data.to).emit('videoStateChanged', {
        isVideoOn: data.isVideoOn,
      });
    });

    // ✅ Relay Push Notifications using Firebase Admin
    socket.on('sendNotification', data => {
      if (data.token) {
        sendPush(data.token, data.title, data.body, { friendId: data.senderId, friendName: data.title, chatId: data.chatId, msgId: data.msgId });
      }
    });

  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error('IO not initialized.');
  } else {
    return IO;
  }
};