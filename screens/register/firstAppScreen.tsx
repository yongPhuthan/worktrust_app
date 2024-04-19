// screens/FirstAppScreen.tsx
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {Button, TextInput, ActivityIndicator} from 'react-native-paper';
import {BRAND_NAME} from '@env';
import firebase from '../../firebase';

const FirstAppScreen = ({navigation}: any) => {
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  const handleLogin = () => {
    navigation.navigate('LoginMobileScreen');
  };

  const handleRegister = () => {
    navigation.navigate('SignupMobileScreen');
  };
  //   useEffect(() => {
  //     const unsubscribe = firebase.auth().onAuthStateChanged(user => {
  //       if (user) {
  //         // If there's a user, sign them out
  //         firebase.auth().signOut();
  //       }

  //     });

  //     return unsubscribe;
  // }, []);
const appCheck = async () => {
  try {
    const { token } = await firebase.appCheck().getToken(true);
  
    if (token.length > 0) {
      console.log('AppCheck verification passed');
    }
  } catch (error) {
    console.log('AppCheck verification failed');
  }
}

useEffect(() => {
  appCheck();
}
, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: '20%',
        justifyContent: 'space-between',
      }}>
      <Text style={styles.logo}>{BRAND_NAME}</Text>
      <Image
        style={styles.image}
        source={require('../../assets/images/Buildingpermit-bro.png')}
      />
      <Text style={styles.heading}>ระบบเสนอราคาเพื่อปิดการขาย</Text>
      <Text style={styles.heading}>สำหรับช่าง-ผู้รับเหมาช่วง</Text>

      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          marginBottom: 10,
          gap: 15,
        }}>
        <Button
          mode="contained"
          labelStyle={{
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'SukhumvitSet-Bold',
            lineHeight: 24,
          }}
          contentStyle={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center',
          
          }}
          children="ลงทะเบียนใช้งาน"
          style={{
       
            width: '80%',
          }}
          onPress={handleRegister}></Button>
        <Button
          mode="outlined"
          
          labelStyle={{
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'SukhumvitSet-Bold',
          }}
          contentStyle={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center',
          
          }}
          style={{
            width: '80%',
   
          }}
          onPress={handleLogin}>
          เข้าสู่ระบบ{' '}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    fontSize: 32,
    color: '#012b20',
    marginBottom: 32,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 18,
    // fontWeight: 'bold',
    textAlign: 'center',
    color: '#5C5F62',

    fontFamily: 'SukhumvitSet-Bold',
  },
  bulletPointContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    color: '#5C5F62',
    marginRight: 8,
  },
  description: {
    fontSize: 18,
    color: '#5C5F62',
  },
  container: {
    flex: 1,
    marginTop: 200,
    alignItems: 'center',

    justifyContent: 'center',
    backgroundColor: 'white',
  },

  image: {
    width: '80%', // Example static image path
    height: 200, // Set your desired size
    resizeMode: 'contain',
    marginBottom: 50,
  },
  pressable: {
    paddingVertical: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  getStartedButton: {
    width: '90%',
    backgroundColor: '#012b20', // Shopify's button color for 'Get started'
  },
  loginButton: {
    height: 40,
    width: '90%',
  },
  pressableText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'SukhumvitSet-Bold',

    textAlign: 'center', // Ensure text is centered within the full width buttons
  },
  pressableTextLogin: {
    color: '#5C5F62',
    fontSize: 16,
    fontFamily: 'SukhumvitSet-Bold',
    textAlign: 'center', // Ensure text is centered within the full width buttons
  },
});

export default FirstAppScreen;
