/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { getFirestore, doc, collection, updateDoc } from '@react-native-firebase/firestore';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Notifee background event handled:', type);
});

// Handle background messages
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  if (remoteMessage.data?.chatId && remoteMessage.data?.msgId) {
    try {
      const db = getFirestore();
      await updateDoc(
        doc(collection(doc(collection(db, 'chats'), remoteMessage.data.chatId), 'messages'), remoteMessage.data.msgId),
        { status: 'delivered' }
      );
      console.log('Message marked as delivered.');
    } catch (e) {
      console.log('Error updating message status to delivered:', e);
    }
  }

  // Handle building local notification manually because server sent data-only message
  if (remoteMessage.data?.notificationTitle || remoteMessage.data?.notificationBody) {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    let notifId = remoteMessage.messageId || String(Date.now());
    const titleStr = remoteMessage.data?.notificationTitle || '';
    if (remoteMessage.data?.isCall === 'true' || titleStr.includes('Call')) {
       const callRef = remoteMessage.data?.callerId || remoteMessage.data?.friendId;
       if (callRef) notifId = `call_${callRef}`;
    }

    await notifee.displayNotification({
      id: notifId,
      title: titleStr || 'New Message',
      body: remoteMessage.data.notificationBody || 'You have a new message.',
      data: remoteMessage.data, // Important for app open logic
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        color: '#510DC0',
        pressAction: {
          id: 'default',
        },
      },
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
