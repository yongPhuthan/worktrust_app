// src/hooks/usePhoneAuth.ts
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as yup from 'yup';
import firebase from '../../../firebase';

const LoginMobileSchema = yup.object().shape({
  phoneNumber: yup.string().required('กรุณากรอกหมายเลขโทรศัพท์').matches(/^[0-9]{10}$/, 'หมายเลขโทรศัพท์ไม่ถูกต้อง'),
});

interface LoginMobileSchemaType {
  phoneNumber: string;
}

const formatPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.startsWith('0')) {
    return '+66' + phoneNumber.substring(1);
  }
  return phoneNumber; // return the original if it doesn't start with '0'
};

const usePhoneAuth = () => {
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(60);
  const intervalRef = useRef<any | null>(null);
  const firestore = firebase.firestore;
  const auth = firebase.auth;

  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t - 1);
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

  const signInWithPhoneNumber = useCallback(
    async (data: LoginMobileSchemaType) => {
      setLoading(true);
      setError(null);
      try {
        const registerValidated = await LoginMobileSchema.validate(data);
        const formattedPhoneNumber = formatPhoneNumber(registerValidated.phoneNumber);
        const usersRef = firestore().collection('users');
        const snapshot = await usersRef.where('phoneNumber', '==', formattedPhoneNumber).get();

        if (!snapshot.empty) {
          setError('หมายเลขนี้สมัครสมาชิกแล้ว โปรดไปที่หน้าเข้าสู่ระบบ');
          return;
        }

        const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
        setConfirm(confirmation);
        setTimer(60);
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resendCode = useCallback(async (phoneNumber: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    try {
      const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
      setConfirm(confirmation);
      setTimer(60);
    } catch (err) {
      setError('Failed to resend code');
    }
  }, []);

  const confirmCode = useCallback(
    async (code: string) => {
      setLoading(true);
      setError(null);
      try {
        if (confirm) {
          await confirm.confirm(code);
          return { success: true, message: 'User created successfully' };
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Invalid code or error in adding user to Firestore');
        }
      } finally {
        setLoading(false);
      }

      return {
        success: false,
        message: 'Invalid code or error in adding user to Firestore',
      };
    },
    [confirm]
  );

  return {
    signInWithPhoneNumber,
    resendCode,
    confirmCode,
    confirm,
    loading,
    error,
    timer,
  };
};

export default usePhoneAuth;