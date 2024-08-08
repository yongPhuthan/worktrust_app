import { useCallback, useState } from 'react';
import * as yup from 'yup';
import firebase from '../../../firebase';
import { RegisterEmailSchema } from '../../../models/validationSchema/register/registerScreen';

interface CreateUserResponse {
  success: boolean;
  message: string;
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

const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firestore = firebase.firestore;
  const auth = firebase.auth;
  const createUser = useCallback(
    async (email: string, password: string, confirmPassword: string): Promise<CreateUserResponse> => {

      setLoading(true);
      setError(null);
  
      try {
        const registerValidated = await RegisterEmailSchema.validate({
          email,
          password,
          confirmPassword,
        });
  
        if (registerValidated.password !== registerValidated.confirmPassword) {
          throw new Error('รหัสผ่านไม่ตรงกัน');
        }
  
        const userCredential = await auth().createUserWithEmailAndPassword(
          registerValidated.email,
          registerValidated.password,
        );
        const user = userCredential.user;
  
        if (!user || !user.uid || !user.email) {
          throw new Error('User creation was successful, but no user data was returned.');
        }
  
        // ไม่ต้องบันทึกข้อมูลลง Firestore ที่นี่
        setLoading(false);
        return {success: true, message: 'User created successfully'};
      } catch (err: unknown) {
        setLoading(false);
        if (err instanceof yup.ValidationError) {
          setError(err.message);
          return {success: false, message: err.message};
        } else if (err instanceof Error) {
          const firebaseError = err as SignUpError;
          setError(firebaseError.message);
          return {success: false, message: firebaseError.message};
        } else {
          const message = 'An unknown error occurred';
          setError(message);
          return {success: false, message};
        }
      }
    },
    [],
  );

  return {createUser, loading, error};
};

export default useCreateUser;
