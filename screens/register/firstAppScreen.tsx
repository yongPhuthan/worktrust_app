// screens/FirstAppScreen.tsx
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import React, {useEffect, useState} from 'react';
import {Image, Dimensions, StyleSheet, View} from 'react-native';
import {Button, TextInput, Text, Divider} from 'react-native-paper';
import {BRAND_NAME, BACK_END_SERVER_URL} from '@env';
import firebase from '../../firebase';
const { width, height } = Dimensions.get('window');

const FirstAppScreen = ({navigation}: any) => {
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  const handleLogin = () => {
    navigation.navigate('LoginMobileScreen');
  };

  const handleRegister = () => {
    navigation.navigate('SignupMobileScreen');
  };

  const appCheck = async () => {
    try {
      const {token} = await firebase.appCheck().getToken(true);

      if (token.length > 0) {
        console.log('AppCheck verification passed');
      }
    } catch (error) {
      console.log('AppCheck verification failed');
    }
  };

  useEffect(() => {
    appCheck();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        marginVertical: '15%',
        gap: 20,
        justifyContent: 'space-between',
      }}>
        <View></View>
        <View 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
        
        >
        <Text style={styles.logo}>Work</Text>
        <Text style={styles.logo}>Standard</Text>

        </View>

{/* <View style={{
  flexDirection: 'row',
 
  alignItems: 'center',
}}>
 <Image
          source={require('../../assets/images/blacklogo.png')}
          style={styles.logoImage}
          />
          <View style={styles.divider} />
      <Text style={styles.logo}>{BRAND_NAME}</Text>
</View> */}
        
      <Image
        style={styles.image}
        source={require('../../assets/images/BuildingPermit.png')}
      />
      <View>
     
      <Text style={styles.heading}>ระบบเสนอราคาเพื่อปิดการขาย</Text>
      <Text style={styles.heading}>สำหรับช่าง-ผู้รับเหมาช่วง</Text>
      </View>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',

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
    fontSize: 28,
    // color: '#5C5F62',
    fontFamily:'sans-serif',

    color: '#00084c',
    fontWeight: 'bold',
  },
  logoImage: {
    width: width * 0.2,
    height: height * 0.1,
    resizeMode: 'contain', // เพื่อให้รูปภาพรักษาสัดส่วนของมัน
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
    width: width * 0.80,

    height: height * 0.30,
    resizeMode: 'contain',

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
  divider: {
    width: 1, // Thickness of the divider
    backgroundColor: '#000', // Color of the divider
    height: '100%', // Full height of the container
  },
  pressableTextLogin: {
    color: '#5C5F62',
    fontSize: 16,
    fontFamily: 'SukhumvitSet-Bold',
    textAlign: 'center', // Ensure text is centered within the full width buttons
  },
});

export default FirstAppScreen;
