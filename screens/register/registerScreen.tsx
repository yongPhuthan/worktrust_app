import React, {useState} from 'react';
import {Dimensions, SafeAreaView, StyleSheet, View} from 'react-native';
import {Appbar, Button, Snackbar, Text, TextInput} from 'react-native-paper';

import {Controller, useForm, useWatch} from 'react-hook-form';

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
interface SignUpError {
  code: string;
  message: string;
  userInfo?: {
    authCredential: null;
    resolver: null;
  };
  name?: string;
  namespace?: string;
  nativeErrorCode?: string;
  nativeErrorMessage?: string;
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
  // registrationCode: yup.string().required('กรอกรหัสลงทะเบียน'),
});
const RegisterScreen = ({navigation}: Props) => {
  const [userLoading, setUserLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
      confirmPassword: '',
    },
    resolver: yupResolver(schema),
  });
  const email = useWatch({control, name: 'email'});
  const password = useWatch({control, name: 'password'});
  const confirmPassword = useWatch({control, name: 'confirmPassword'});
  // const registrationCode = useWatch({control, name: 'registrationCode'});
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

      await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          navigation.navigate('CreateCompanyScreen');
        });

    } catch (error) {
      console.error('Error during signUpEmail function', error);
      if ((error as SignUpError).code === 'auth/email-already-in-use') {
        setSnackbarMessage('อีเมลนี้ถูกใช้งานแล้ว');
        setSnackbarVisible(true);
      }
    } finally {
      setUserLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
      </Appbar.Header>
      <SafeAreaView>
        {/* Add your input fields... */}

        <View style={{marginTop: 40, paddingHorizontal: 20}}>
          <Text style={styles.title}>ลงทะเบียนด้วยอีเมล</Text>
          <Controller
            name="email"
            control={control}
            render={({
              field: {onBlur, onChange, value},
              fieldState: {error},
            }) => (
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
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({
              field: {onBlur, onChange, value},
              fieldState: {error},
            }) => (
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
            render={({
              field: {onBlur, onChange, value},
              fieldState: {error},
            }) => (
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
          {/* <Controller
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
        /> */}
          <Button
            mode="contained"
            style={{
              width: '100%',

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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => {
            // Possibly clear input or focus email input for correction
          },
        }}>
        {snackbarMessage}
      </Snackbar>
    </>
  );
};
const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SukhumvitSet-Bold',
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
