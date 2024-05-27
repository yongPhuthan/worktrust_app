import {yupResolver} from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useRef, useState} from 'react';
import {Dimensions, SafeAreaView, StyleSheet, View, Alert} from 'react-native';
import {Appbar, Button, Text, TextInput} from 'react-native-paper';
import firebase from '../../../firebase';

import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {StackNavigationProp} from '@react-navigation/stack';
import {Controller, set, useForm} from 'react-hook-form';
import {ParamListBase} from '../../../types/navigationType';
import {signupMobilevalidationSchema} from '../../utils/validationSchema';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'LoginMobileScreen'>;
}
const LoginMobileScreen = ({navigation}: Props) => {
  // If null, no SMS has been sent
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');

  // State for each input field
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  // Timer state
  const [timer, setTimer] = useState<number>(60);
  const inputRefs = useRef<Array<any | null>>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken(true);
        if (token) {
          await AsyncStorage.setItem('userToken', token);
          navigation.reset({
            index: 0,
            routes: [{name: 'DashboardQuotation'}],
          });
        } else {
          console.error('Token is undefined after login');
        }
      }
    });

    return () => unsubscribe();
  }, []);
  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    formState: {isValid, isDirty, errors},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      phoneNumber: '',
    },
    resolver: yupResolver(signupMobilevalidationSchema),
  });
  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.startsWith('0')) {
      return '+66' + phoneNumber.substring(1);
    }
    return phoneNumber; // return the original if it doesn't start with '0'
  };
  const signInWithPhoneNumber = handleSubmit(async data => {
    try {
      setIsLoading(true);
      const {phoneNumber} = data; // destructuring phoneNumber from the form data
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber); // Format the phone number

      const confirmation = await firebase
        .auth()
        .signInWithPhoneNumber(formattedPhoneNumber);
      // Proceed with the confirmation process
      setConfirm(confirmation);
      //get refId from sms
      setInterval(() => {
        setTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
    } catch (error) {
      console.error(error);
      // Handle errors here
    } finally {
      setIsLoading(false);
    }
  });

  const resendCode = async () => {
    if (code) {
     setCode('');
    }
    const phoneNumber = getValues('phoneNumber');
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    try {
      const confirmation = await firebase
        .auth()
        .signInWithPhoneNumber(formattedPhoneNumber);
      setConfirm(confirmation);
      setTimer(60);
    } catch (error) {
      console.error('Failed to resend code:', error);
    }
  };

  const confirmCode = async () => {
    setIsLoading(true);
    try {
      // Combine all OTP digits into a single string
   

      if (confirm) {
        await confirm.confirm(code);

        const user = firebase.auth().currentUser;
        if (!user || !user.uid) {
          throw new Error(
            'User creation was successful, but no user data was returned.',
          );
        }
      }
    } catch (error) {
      console.error(
        'Invalid code or error in adding user to Firestore:',
        error,
      );
      Alert.alert('Error', 'Invalid code or error in adding user to Firestore');

      // Handle the invalid code case or error in adding user to Firestore
    } finally {
      setIsLoading(false);
    }
  };

  // Function to focus the next input
  const focusNextInput = (index: number, value: string) => {
    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };
  const isOtpComplete = otp.every(digit => digit.trim().length === 1);

  // Function to focus the previous input
  const focusPreviousInput = (key: string, index: number) => {
    if (key === 'Backspace' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const phoneNumber = getValues('phoneNumber'); // Get the phone number from the form
  React.useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer]);
  const isCodeValid = code.length === 6;

  if (!confirm) {
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
        <SafeAreaView style={styles.container}>
          <View style={styles.body}>
            <Text
              style={{
                fontSize: 24,
                marginBottom: 20,
                fontWeight: 'bold',
                fontFamily: 'Sukhumvit Set Bold',
              }}>
              เข้าสู่ระบบ
            </Text>
            <Text style={{fontSize: 16, marginBottom: 10}}>
              ใส่หมายเลขโทรศัพท์ของคุณเพื่อเริ่มต้นใช้งาน
            </Text>
            <Controller
              name="phoneNumber"
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
                    placeholderTextColor={'gray'}
                    maxLength={10}
                    textContentType="telephoneNumber"
                    textAlign="center"
                    placeholder="หมายเลขโทรศัพท์"
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone" />}
                    mode="outlined"
                    // error={!!error}
                  />
                </View>
              )}
            />

            <Button
              loading={isLoading}
              disabled={!isValid}
              labelStyle={{
                fontWeight: 'bold',
                fontFamily: 'Sukhumvit Set Bold',
                lineHeight: 24,
                fontSize: 16,
              }}
              mode="contained"
              onPress={signInWithPhoneNumber}
              style={styles.button}>
              ต่อไป
            </Button>
            <Button
              contentStyle={{}}
              style={{
                marginTop: 10,
              }}
              onPress={() => navigation.navigate('LoginScreen')}>
              {' '}
              <Text
                children="หรือ เข้าสู่ระบบด้วยอีเมล"
                style={{
                  fontFamily: 'Sukhumvit Set Bold',
                }}></Text>
            </Button>
          </View>
        </SafeAreaView>
      </>
    );
  }

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

      <View style={styles.body}>
        <Text
          style={{
            fontSize: 24,
            marginBottom: 20,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}>
          ใส่รหัส OTP
        </Text>
        <Text style={styles.timerText}>
          ใส่รหัส 6 หลักที่เราได้ส่งไปที่หมายเลข{' '}
        </Text>
        <Text style={styles.timerText2}> {phoneNumber}</Text>

        <View style={styles.otpContainer}>
        <TextInput
              mode="outlined"
              style={styles.otpInput}
              textAlign="center"
              textAlignVertical="center"
              keyboardType="numeric"
              
              inputMode="numeric"
              textContentType="oneTimeCode"
              maxLength={6}
              onChangeText={value => setCode(value)}
              value={code}
            />
        </View>
        <Button
          loading={isLoading}
          disabled={!isCodeValid || isLoading}
          mode="contained"
          contentStyle={{
            width: '100%',
          }}
          labelStyle={{
            fontFamily: 'Sukhumvit Set Bold',
            fontWeight: 'bold',
            lineHeight: 24,
            fontSize: 16,
          }}
          onPress={confirmCode}>
          ต่อไป
        </Button>

        {/* Display phone number and reference */}
        {timer === 0 ? (
          <Button mode="text" onPress={resendCode}>
            ส่งรหัสอีกครั้ง
          </Button>
        ) : (
          <Text style={styles.rimindText}>
            กรุณารอ {timer} ก่อนกดส่งอีกครั้ง
          </Text>
        )}
      </View>
    </>
  );
};
export default LoginMobileScreen;

const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
  },

  body: {
    flexDirection: 'column',
    padding: 20,
    marginTop: height * 0.1,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
  },
  containerOtp: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: '100%',
    height: 45,
    textAlign: 'center',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',

    marginBottom: 5,
  },
  timerText2: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',

    marginBottom: 20,
  },
  rimindText: {
    fontSize: 16,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    fontWeight: 'bold',
  },
  infoText: {
    marginTop: 20,
  },
});
