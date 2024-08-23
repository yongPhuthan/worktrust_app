import {useContext, useEffect, useState} from 'react';
import {MaterialSchemaType} from 'validation/collection/subcollection/materials';
import firebase from '../../firebase';
import {useUser} from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';
const useFetchMaterial = () => {
  const user = useUser();
  const {
    dispatch,
    state: {companyId},
  } = useContext(Store);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const firestore = firebase.firestore;
  const fetchMaterialFromFirestore = async () => {
    console.log('FETCHING MATERIAL FROM FIRESTORE');
    if (!user) {
      setIsError(true);
      setError({message: 'User not authenticated.', action: 'logout'});
      setIsLoading(false);
      return;
    }

    try {
      // Disable network to force Firestore to use cache first
      await firestore().disableNetwork();

      // ดึงข้อมูลจากแคชใน Firestore ก่อน
      const snapshot = await firestore()
        .collection('companies')
        .doc(companyId)
        .collection('materials')
        .get();

      if (!snapshot.empty) {
        console.log('Loaded materials from cache');
        const materials: MaterialSchemaType[] = snapshot.docs.map(
          doc => doc.data() as MaterialSchemaType,
        );
        dispatch(stateAction.get_material(materials));
        setIsError(false);
      } else {
        console.log('No materials found in cache, fetching from server...');

        // Re-enable network to fetch from the server
        await firestore().enableNetwork();

        // ดึงข้อมูลจากเซิร์ฟเวอร์ถ้าไม่มีในแคช
        const serverSnapshot = await firestore()
          .collection('companies')
          .doc(companyId)
          .collection('materials')
          .get();

        if (!serverSnapshot.empty) {
          const materials: MaterialSchemaType[] = serverSnapshot.docs.map(
            doc => doc.data() as MaterialSchemaType,
          );
          dispatch(stateAction.get_material(materials));
          setIsError(false);
        } else {
          console.log('No materials found in Firestore');
          setIsError(true);
          setError({message: 'No materials found', action: 'retry'});
        }
      }
    } catch (err) {
      console.error(
        'An error occurred while fetching the material from Firestore:',
        err,
      );
      setIsError(true);
      setError({
        message: 'Failed to fetch data from Firestore',
        action: 'retry',
      });
    } finally {
      setIsLoading(false);
      await firestore().enableNetwork(); // Re-enable network after operation
    }
  };

  useEffect(() => {
    fetchMaterialFromFirestore(); // Load data from Firestore on component mount
  }, []);

  return {
    isLoading,
    isError,
    error,
    refetch: fetchMaterialFromFirestore,
  };
};

export default useFetchMaterial;
