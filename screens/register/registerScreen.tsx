import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';

import {Controller, useForm, useWatch} from 'react-hook-form';

import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {StackNavigationProp} from '@react-navigation/stack';
import firebase from '../../firebase';
import {ParamListBase} from '../../types/navigationType';

import {BACK_END_SERVER_URL} from '@env';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {useUser} from '../../providers/UserContext';
const screenWidth = Dimensions.get('window').width;
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'RegisterScreen'>;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .email('รูปแบบอีเมลล์ไม่ถูกต้อง')
    .required('กรุณากรอกอีเมลล์'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), ''], 'รหัสผ่านไม่ตรงกัน')
    .required('ยืนยันรหัสผ่าน'),
  registrationCode: yup.string().required('กรอกรหัสลงทะเบียน'),
});
const RegisterScreen = ({navigation}: Props) => {
  const [userLoading, setUserLoading] = useState(false);
  const user = useUser();

  const [error, setError] =
    useState<FirebaseAuthTypes.NativeFirebaseAuthError | null>(null);

  const {
    handleSubmit,
    control,
    formState: {isValid, isDirty, errors},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      registrationCode: '',
      confirmPassword: '',
    },
    resolver: yupResolver(schema),
  });
  const email = useWatch({control, name: 'email'});
  const password = useWatch({control, name: 'password'});
  const confirmPassword = useWatch({control, name: 'confirmPassword'});
  const registrationCode = useWatch({control, name: 'registrationCode'});
  const [passwordVisible, setPasswordVisible] = useState(false);
  function isFirebaseAuthError(
    error: any,
  ): error is FirebaseAuthTypes.NativeFirebaseAuthError {
    return (
      error &&
      typeof error.code === 'string' &&
      typeof error.message === 'string'
    );
  }
  const signUpEmail = async () => {
    console.log('Starting signUpEmail function');
    setUserLoading(true);
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      console.log('Stored email and password in AsyncStorage');

      if (password !== confirmPassword) {
        console.log('Passwords do not match');
        setError({
          code: 'auth/passwords-not-matching',
          message: 'รหัสผ่านไม่ตรงกัน',
          userInfo: {authCredential: null, resolver: null},
          name: 'FirebaseAuthError',
          namespace: '',
          nativeErrorCode: '',
          nativeErrorMessage: '',
        });
        setUserLoading(false);
        return;
      }

      // const docRef = firebase.firestore().collection('registrationCodes').doc(registrationCode);
      // const doc = await docRef.get();
      // console.log('Fetched registration code document');

      // if (!doc.exists) {
      //   console.log('Registration code does not exist');
      //   setError({
      //     code: 'auth/invalid-registration-code',
      //     message: 'รหัสลงทะเบียนไม่ถูกต้อง',
      //     userInfo: { authCredential: null, resolver: null },
      //     name: 'FirebaseAuthError',
      //     namespace: '',
      //     nativeErrorCode: '',
      //     nativeErrorMessage: '',
      //   });
      //   setUserLoading(false);
      //   return;
      // }

      // if (doc.data()?.used) {
      //   console.log('Registration code already used');
      //   setError({
      //     code: 'auth/registration-code-used',
      //     message: 'รหัสลงทะเบียนนี้ถูกใช้แล้ว',
      //     userInfo: { authCredential: null, resolver: null },
      //     name: 'FirebaseAuthError',
      //     namespace: '',
      //     nativeErrorCode: '',
      //     nativeErrorMessage: '',
      //   });
      //   setUserLoading(false);
      //   return;
      // }

      // await docRef.update({ used: true });
      // console.log('Marked registration code as used');

      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('Created new user with email and password', user);

      if (!user || !user.email) {
        throw new Error(
          'User creation was successful, but no user data was returned.',
        );
      }

      const token = await user.getIdToken(true);
      console.log('Fetched user ID token', token);

      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/createUser`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({email: user.email, uid: user.uid}),
        },
      );
      console.log('Server response for createUser', response);

      if (!response.ok) {
        throw new Error('Failed to create user on the server');
      }

      const responseData = await response.json();
      console.log('Server response data', responseData);

      navigation.navigate('CreateCompanyScreen');
      setUserLoading(false);
      console.log('Finished signUpEmail function successfully');
    } catch (error) {
      console.error('Error during signUpEmail function', error);
      // Logic to handle different types of errors, e.g., Firebase Auth errors or other errors
      setUserLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  async function testFirestoreConnection() {
    try {
      await firebase
        .firestore()
        .collection('TestCollection')
        .doc('TestDocument')
        .set({
          message: 'Hello, this is a test document!',
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      console.log('Document successfully written to the Firestore emulator!');
    } catch (error) {
      console.error('Error writing document to Firestore emulator:', error);
    }
  }

  return (
    <SafeAreaView style={{marginTop: 10, paddingHorizontal: 10}}>
      {/* Add your input fields... */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <FontAwesomeIcon icon={faArrowLeft} size={26} color="#5C5F62" />
      </TouchableOpacity>
      <View style={{marginTop: 40, paddingHorizontal: 20}}>
        <Text style={styles.title}>สมัครสมาชิก</Text>
        <Controller
          name="email"
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                value={value}
                error={!!error}
                label={'อีเมล'}
                mode="outlined"
              />
              {/* {error && <Text style={styles.errorText}>{error.message}</Text>} */}
            </View>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                label="รหัสผ่าน"
                keyboardType="visible-password"
                secureTextEntry={!passwordVisible}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={togglePasswordVisibility}
                  />
                }
                mode="outlined"
                error={!!error}
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!error}
                label={'ยืนยันรหัสผ่าน'}
                right={<TextInput.Icon icon="eye" />}
                secureTextEntry
                keyboardType="visible-password"
                mode="outlined"
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />
        <Controller
          name="registrationCode"
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="default"
                value={value}
                error={!!error}
                label={'รหัสลงทะเบียน'}
                mode="outlined"
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />
        <Button
          mode="contained"
          style={{
            width: '100%',
            borderRadius: 4,
            marginVertical: 20,
          }}
          loading={userLoading}
          // onPress={testFirestoreConnection}
          onPress={signUpEmail}
          disabled={!isValid}>
          <Text style={styles.pressableText}>ลงทะเบียน</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    color: '#FFFFFF',
    borderRadius: 5,
    marginTop: 20,
    width: 100,
    height: 50, // Adjust as necessary
    padding: 10, // Adjust as necessary
  },

  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderRadius: 5,
    marginVertical: 10,
    height: 40,
    borderWidth: 0.5,
    borderColor: 'black',
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
  },
  loginButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: screenWidth - 50,
    height: 48,
    borderRadius: 10,
  },
  pressable: {
    width: '100%',
    borderRadius: 4,
    marginVertical: 20,
  },
  getStartedButton: {
    backgroundColor: '#012b20',
  },

  pressableText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  pressableTextLogin: {
    color: '#5C5F62',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 16,
  },
});
export default RegisterScreen;
