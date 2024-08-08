// LoginScreen.tsx
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Appbar, Button, TextInput } from 'react-native-paper';
import { ValidationError } from 'yup';
import { ParamListBase } from '../../types/navigationType';
import { LoginEmailSchema, LoginEmailSchemaType } from '../../models/validationSchema/register/loginScreen';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'LoginScreen'>;
}

const LoginScreen = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const height = Dimensions.get('window').height;

  const {
    handleSubmit,
    control,
    formState: {isValid, isDirty, errors},
  } = useForm<LoginEmailSchemaType>({
    mode: 'onChange',
    resolver: yupResolver(LoginEmailSchema),
  });
  const email = useWatch({control, name: 'email'});
  const password = useWatch({control, name: 'password'});
  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const loginValidated = await LoginEmailSchema.validate({
        email,
        password,
      });
      const userCredential = await auth().signInWithEmailAndPassword(
        loginValidated.email,
        loginValidated.password,
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      if (token) {
        await AsyncStorage.setItem('userToken', token);
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{name: 'DashboardQuotation'}],
        });
      } else {
        console.error('Token is undefined after login');
        setIsLoading(false);
      }
    } catch (error: unknown) {
        setIsLoading(false);
    
        if (error instanceof ValidationError) {
          Alert.alert('เกิดข้อผิดพลาด', error.message);
        } else if (error instanceof Error && (error as any).code) {
          const errorCode = (error as any).code;
    
          let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
          if (errorCode === 'auth/wrong-password') {
            errorMessage = 'รหัสผ่านไม่ถูกต้อง';
          } else if (errorCode === 'auth/user-not-found') {
            errorMessage = 'ไม่พบผู้ใช้งาน';
          } else if (errorCode === 'auth/invalid-email') {
            errorMessage = 'อีเมลไม่ถูกต้อง';
          }
          console.error('Login error:', error);
          Alert.alert('เกิดข้อผิดพลาด', errorMessage);
        } else {
          console.error('Unexpected error:', error);
          Alert.alert('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
      }
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
    <SafeAreaView style={{marginTop: 10, paddingHorizontal: 10}}>

      <View
        style={{marginTop: height * 0.1, paddingHorizontal: 20, alignContent: 'center'}}>
<Text
              style={{
                fontSize: 24,
                marginBottom: 20,
                fontWeight: 'bold',
                fontFamily: 'Sukhumvit Set Bold',
              }}>
              เข้าสู่ระบบด้วยอีเมล
            </Text>

        <Controller
          name="email"
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                error={!!error}
                label={'อีเมล'}
                mode="outlined"
              />
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
                error={!!error}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                keyboardType="default"
                label={'รหัสผ่าน'}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={togglePasswordVisibility}
                  />
                }
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        <Button
          mode="contained"
          loading={isLoading}
          onPress={handleLogin}
          disabled={!isValid || isLoading}>
          <Text style={styles.pressableText}>เข้าสู่ระบบ</Text>
        </Button>
      </View>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cacaca',
  },
  buttonTextDisabled: {
    color: 'white',
  },
  title: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Sukhumvit Set Bold',

  },
  subtitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Sukhumvit Set Bold',

  },
  errorText: {
    color: 'red',
  },
  input: {
    width: '90%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
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
  button: {
    width: '90%',
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: '#012b20', // Shopify button color
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
