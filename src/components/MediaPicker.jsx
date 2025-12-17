import {PermissionsAndroid, Alert} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

// Ask for camera permission
async function requestCameraPermission() {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'App needs access to your camera to take pictures.',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export const pickMedia = async () => {
  return new Promise((resolve) => {
    Alert.alert('Select Option', 'Choose media source', [
      {
        text: 'Take Picture',
        onPress: async () => {
          const hasPermission = await requestCameraPermission();
          if (!hasPermission) {
            console.log('Camera permission denied');
            return resolve(null);
          }

          const cameraOptions = {
            mediaType: 'photo',
            quality: 1,
            saveToPhotos: true,
          };

          const result = await launchCamera(cameraOptions);

          if (result.didCancel) return resolve(null);
          if (result.errorMessage) {
            console.log('Camera Error:', result.errorMessage);
            return resolve(null);
          }

          console.log('Captured image:', result.assets?.[0]);
          return resolve(result.assets?.[0] || null);
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const galleryOptions = {
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 5,
          };

          const result = await launchImageLibrary(galleryOptions);

          if (result.didCancel) return resolve(null);
          if (result.errorMessage) {
            console.log('Gallery Error:', result.errorMessage);
            return resolve(null);
          }

          console.log('Selected image:', result.assets?.[0]);
          return resolve(result.assets?.[0] || null);
        },
      },
      {text: 'Cancel', style: 'cancel', onPress: () => resolve(null)},
    ]);
  });
};
