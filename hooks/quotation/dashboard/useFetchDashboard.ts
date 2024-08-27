import { useState, useEffect,useContext } from 'react';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import { useUser } from '../../../providers/UserContext';
import { QuotationSchemaType } from '../../../validation/collection/subcollection/quotations';
import { CompanyType } from '../../../validation/collection/companies';
import { UserType } from '../../../validation/collection/users';
import { WorkerSchemaType } from '../../../validation/collection/subcollection/workers';
import { QuotationEventsType } from 'validation/collection/subcollection/events';
import * as stateAction from '../../../redux/actions';
import { Store } from '../../../redux/store';
import {FirebaseDatabaseTypes} from '@react-native-firebase/database';
const useFetchDashboard = (navigation: any) => {
  const user = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {
    dispatch,
    state: {quotations,companyId, quotations_events},
  } = useContext(Store);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const fetchCompanyId = async (uid: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      console.log('Company ID data is from cache:', userDoc.metadata.fromCache);

      if (userDoc.exists) {
        const userData = userDoc.data() as UserType;
        return { companyId: userData?.currentCompanyId || null, userData };
      } else {
        console.error('User not found');
        return { companyId: null, userData: null };
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { companyId: null, userData: null };
    }
  };
  const fetchDashboardData = async (companyId: string) => {
    try {
      // ดึงข้อมูล quotations จาก Firestore
      const quotationsRef = firestore()
        .collection('companies')
        .doc(companyId)
        .collection('quotations');
      const quotationsSnapshot = await quotationsRef.get();
    
      let quotations = quotationsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as QuotationSchemaType[];
    
      // ดึงข้อมูล quotationEvents จาก Realtime Database
      const quotationEventsRef = database().ref(`companies/${companyId}/quotations`);
      const quotationEventsSnapshot = await new Promise<QuotationEventsType[]>((resolve, reject) => {
        quotationEventsRef.once('value', snapshot => {
          const quotationEvents: QuotationEventsType[] = [];
          snapshot.forEach((childSnapshot : FirebaseDatabaseTypes.DataSnapshot)  => {
            quotationEvents.push({
              ...childSnapshot.val(),
              quotationId: childSnapshot.key || '',
            });
            return undefined;
          });
          resolve(quotationEvents);
        });
      });
    
      // Merge ข้อมูล quotationEvents เข้ากับ quotations
      let mergedQuotations = quotations.map(quotation => {
        const events = quotationEventsSnapshot.find(event => event.quotationId === quotation.id);
        return {
          ...quotation,
          events: events || {}, // ถ้าไม่มี events ที่ตรงกัน ให้ใช้ว่างเปล่า {}
        };
      });
      
      // ดึงข้อมูล workers จาก Firestore
      const workersRef = firestore()
        .collection('companies')
        .doc(companyId)
        .collection('workers');
      const workersSnapshot = await workersRef.get();
  
      const workers: WorkerSchemaType[] = workersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as WorkerSchemaType[];
  
      // อัปเดต state ด้วยข้อมูลทั้งหมดครั้งแรก
      dispatch(stateAction.get_quotations(mergedQuotations));
      // dispatch(stateAction.get_workers(workers));
    
      // ตั้งค่า listener เพื่อฟังการเปลี่ยนแปลงเฉพาะใน child nodes
      quotationEventsRef.on('child_changed', snapshot => {
        const updatedEvent = {
          ...snapshot.val(),
          quotationId: snapshot.key || '',
        };
    
        console.log('Quotation event changed:', updatedEvent);
    
        // อัปเดต mergedQuotations แบบเรียลไทม์
        mergedQuotations = mergedQuotations.map(quotation => {
          if (quotation.id === updatedEvent.quotationId) {
            return {
              ...quotation,
              events: updatedEvent,
            };
          }
          return quotation;
        });
  
        const sortedQuotations = mergedQuotations.sort((a, b) => {
          const dateA = new Date(a.updateAt || new Date());
          const dateB = new Date(b.updateAt || new Date());
          return dateB.getTime() - dateA.getTime();
        });
        
        // อัปเดต state ด้วย mergedQuotations ที่อัปเดตแล้ว
        dispatch(stateAction.get_quotations(sortedQuotations));
    
      });
    
      return { mergedQuotations, workers };
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setIsError(true);
      setError({ message: 'Failed to fetch data', action: 'retry' });
      return { mergedQuotations: [], workers: [] };
    }
  };

  const loadFromFirestoreCache = async () => {
    try {
      if (!user) {
        setIsError(true);
        setError({ message: 'User not authenticated.', action: 'logout' });
        setIsLoading(false);
        return { company: null, quotations: [], workers: [], userData: null };
      }
  
      await firestore().disableNetwork();
  
      const { companyId, userData } = await fetchCompanyId(user.uid);
      if (!companyId) {
        setIsError(true);
        setError({
          message: 'Company ID not found.',
          action: 'redirectToCreateCompany',
        });
        setIsLoading(false);
        return { company: null, quotations: [], workers: [], userData };
      }
  
      const companyDoc = await firestore()
        .collection('companies')
        .doc(companyId)
        .get();
      const company = companyDoc.exists
        ? (companyDoc.data() as CompanyType)
        : null;
  
      const { mergedQuotations, workers } = await fetchDashboardData(companyId);
  
      if (!company) {
        setIsError(true);
        setError({
          message: 'Company data not found.',
          action: 'redirectToCreateCompany',
        });
        return { company: null, quotations: [], workers: [], userData };
      }
  
      return { company, mergedQuotations, workers, userData };
    } catch (err) {
      console.error('Failed to load data from Firestore cache:', err);
      setIsError(true);
      setError({ message: 'Failed to load data from cache', action: 'retry' });
      return { company: null, quotations: [], workers: [], userData: null };
    } finally {
      await firestore().enableNetwork();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFromFirestoreCache();
  }, []);

  useEffect(() => {
    if (error && error.action) {
      switch (error.action) {
        case 'redirectToCreateCompany':
          navigation.navigate('CreateCompanyScreen');
          break;
        case 'logout':
          // Handle logout
          break;
        case 'retry':
          // Handle retry
          break;
        default:
          console.error('Unhandled error action:', error.action);
      }
    }
  }, [error]);

  return {
    isLoading,
    isError,
    error,
    refetch: loadFromFirestoreCache,
    loadFromFirestoreCache,
  };
};

export default useFetchDashboard;