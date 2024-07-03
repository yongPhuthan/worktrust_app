// LoginScreen.tsx
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {yupResolver} from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {BRAND_NAME} from '@env';
import {Appbar, Button, TextInput} from 'react-native-paper';

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
} from 'react-native';
import * as yup from 'yup';
import {ParamListBase} from '../../types/navigationType';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'LoginScreen'>;
}
const schema = yup.object().shape({
  email: yup
    .string()
    .email('รูปแบบอีเมลล์ไม่ถูกต้อง')
    .required('กรุณากรอกอีเมลล์'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน'),
});
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
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(schema),
  });
  const email = useWatch({control, name: 'email'});
  const password = useWatch({control, name: 'password'});
  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
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
    } catch (error) {
      Alert.alert('Login Error', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');

      setIsLoading(false);
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
