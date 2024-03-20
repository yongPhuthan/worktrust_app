import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/storage';

import {Platform} from 'react-native';

// if (__DEV__) {
//   let emulatorHost = 'localhost';

//   if (Platform.OS === 'android') {
//     emulatorHost = '10.0.2.2';
//   }

//   firebase.auth().useEmulator(`http://${emulatorHost}:9099`);
//   firebase.storage().useEmulator(emulatorHost, 9199);
//   firebase.firestore().useEmulator(emulatorHost, 8080);
// }

console.log('Firebase App name: ', firebase.app().name);

export default firebase;
