import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/storage';
import '@react-native-firebase/app-check';
import '@react-native-firebase/functions';
import '@react-native-firebase/database';
import {Platform} from 'react-native';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_STORAGE_PDF_BUCKET,
  FIREBASE_DATABASE_URL,
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
  databaseURL: FIREBASE_DATABASE_URL,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

if (__DEV__) {
  let emulatorHost = '127.0.0.1';

  if (Platform.OS === 'android') {
    emulatorHost = '10.0.2.2';
  }
  firebase.auth().useEmulator(`http://${emulatorHost}:9099`);
  firebase.storage().useEmulator(emulatorHost, 9199);
  firebase.firestore().useEmulator(emulatorHost, 8080);
  firebase.database().useEmulator(emulatorHost, 9000);
}
const docStorage = firebase.app().storage(FIREBASE_STORAGE_PDF_BUCKET);

console.log('Firebase App name: ', firebase.app().appCheck().app.name);

export { docStorage };
export default firebase;