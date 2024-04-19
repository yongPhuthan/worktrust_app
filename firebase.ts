import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/storage';
import '@react-native-firebase/app-check';

import {Platform} from 'react-native';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  DEBUG_TOKEN,
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}



// if (__DEV__) {
//   let emulatorHost = '127.0.0.1';

//   if (Platform.OS === 'android') {
//     emulatorHost = '10.0.2.2';
//   }

//   firebase.auth().useEmulator(`http://${emulatorHost}:9099`);
//   firebase.storage().useEmulator(emulatorHost, 9199);
//   firebase.firestore().useEmulator(emulatorHost, 8080);
// }

console.log('Firebase App name: ', firebase.app().name);

export default firebase;
