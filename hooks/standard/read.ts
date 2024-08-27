import { BACK_END_SERVER_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { useUser } from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import { Store } from '../../redux/store';
import { QueryKeyType } from '../../types/enums';
import { StandardSchemaType } from '../../validation/collection/subcollection/standard';
import firebase from '../../firebase';
const useFetchStandard = () => {
  const user = useUser();
  const {
    dispatch,
    state: { companyId },
  } = useContext(Store);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const firestore = firebase.firestore;

  const fetchStandardFromServer = async () => {
    console.log('FETCHING STANDARD FROM SERVER');
    if (!user) {
      setIsError(true);
      setError({ message: 'User not authenticated.', action: 'logout' });
      setIsLoading(false);
      return;
    }

    try {
      await firestore().enableNetwork(); // เปิดการเชื่อมต่อเครือข่ายเพื่อดึงข้อมูลจากเซิร์ฟเวอร์

      const standardRef = firestore()
        .collection('companies')
        .doc(companyId)
        .collection('standards');

      const snapshot = await standardRef.get();
      if (!snapshot.empty) {
        const standards: StandardSchemaType[] = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as StandardSchemaType[];

        dispatch(stateAction.get_standard(standards));
      } else {
        throw new Error('No standards found.');
      }

      setIsError(false);
    } catch (err) {
      console.error('An error occurred while fetching the standard:', err);
      setIsError(true);
      setError({ message: 'Failed to fetch data', action: 'retry' });
    } finally {
      setIsLoading(false);
      await firestore().disableNetwork(); // ปิดการเชื่อมต่อเพื่อใช้งานในโหมดออฟไลน์
    }
  };

  const loadFromCache = async () => {
    try {
      await firestore().disableNetwork(); // ปิดการเชื่อมต่อเพื่อโหลดข้อมูลจากแคช

      const standardRef = firestore()
        .collection('companies')
        .doc(companyId)
        .collection('standards');

      const snapshot = await standardRef.get();
      if (!snapshot.empty) {
        const standards: StandardSchemaType[] = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as StandardSchemaType[];

        console.log('LOAD STANDARD FROM CACHE');
        dispatch(stateAction.get_standard(standards));
      } else {
        console.log('No cached standards found, fetching from server.');
        fetchStandardFromServer(); // Fetch from server if cache is empty
      }

      setIsError(false);
    } catch (err) {
      console.error('Failed to load data from cache:', err);
      setIsError(true);
      setError({ message: 'Failed to load data from cache', action: 'retry' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFromCache(); // Load data from Firestore cache on component mount
  }, []);

  return {
    isLoading,
    isError,
    error,
    refetch: fetchStandardFromServer,
  };
};

export default useFetchStandard;
