import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../../../providers/UserContext';
import {QuotationSchemaType} from '../../../validation/collection/subcollection/quotations';
import {CompanyType} from '../../../validation/collection/companies';
import {UserType} from '../../../validation/collection/users';
import {WorkerSchemaType} from '../../../validation/collection/subcollection/workers'; // Assuming you have this type defined

const useFetchDashboard = (navigation: any) => {
  const user = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const fetchCompanyId = async (uid: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      console.log('Company ID data is from cache:', userDoc.metadata.fromCache);

      if (userDoc.exists) {
        const userData = userDoc.data() as UserType;
        return {companyId: userData?.currentCompanyId || null, userData};
      } else {
        console.error('User not found');
        return {companyId: null, userData: null};
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {companyId: null, userData: null};
    }
  };

  const fetchQuotations = async (companyId: string) => {
    try {
      const quotationsRef = firestore()
        .collection('companies')
        .doc(companyId)
        .collection('quotations');

      const snapshot = await quotationsRef.get();
      console.log(
        'Quotations data is from cache:',
        snapshot.metadata.fromCache,
      );

      const quotations: QuotationSchemaType[] = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as QuotationSchemaType[];

      await deleteExpiredQuotations(companyId, quotations);

      return quotations;
    } catch (err) {
      console.error('An error occurred while fetching quotations:', err);
      setIsError(true);
      setError({message: 'Failed to fetch data', action: 'retry'});
      return [];
    }
  };

  const fetchWorkers = async (companyId: string) => {
    try {
      const workersRef = firestore()
        .collection('companies')
        .doc(companyId)
        .collection('workers');

      const snapshot = await workersRef.get();
      console.log('Workers data is from cache:', snapshot.metadata.fromCache);

      const workers: WorkerSchemaType[] = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as WorkerSchemaType[];

      return workers;
    } catch (err) {
      console.error('An error occurred while fetching workers:', err);
      setIsError(true);
      setError({message: 'Failed to fetch data', action: 'retry'});
      return [];
    }
  };
  

  const deleteExpiredQuotations = async (
    companyId: string,
    quotations: QuotationSchemaType[],
  ) => {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    const batch = firestore().batch();

    quotations.forEach(quotation => {
      const dateEnd = new Date(quotation.dateEndUTC);
      if (dateEnd <= sevenDaysAgo) {
        const quotationRef = firestore()
          .collection('companies')
          .doc(companyId)
          .collection('quotations')
          .doc(quotation.id);
        batch.delete(quotationRef);
      }
    });

    await batch.commit();
  };

  const fetchDashboardData = async (companyId: string) => {
    try {
      const quotations = await fetchQuotations(companyId);
      const workers = await fetchWorkers(companyId);

      return {quotations, workers};
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setIsError(true);
      setError({message: 'Failed to fetch data', action: 'retry'});
      return {quotations: [], workers: []};
    }
  };

  const loadFromFirestoreCache = async () => {
    try {
      if (!user) {
        setIsError(true);
        setError({message: 'User not authenticated.', action: 'logout'});
        setIsLoading(false);
        return {company: null, quotations: [], workers: [], userData: null};
      }

      await firestore().disableNetwork();

      const {companyId, userData} = await fetchCompanyId(user.uid);
      if (!companyId) {
        setIsError(true);
        setError({
          message: 'Company ID not found.',
          action: 'redirectToCreateCompany',
        });
        setIsLoading(false);
        return {company: null, quotations: [], workers: [], userData};
      }

      const companyDoc = await firestore()
        .collection('companies')
        .doc(companyId)
        .get();
      const company = companyDoc.exists
        ? (companyDoc.data() as CompanyType)
        : null;

      const dashboardData = await fetchDashboardData(companyId);

      if (!company) {
        setIsError(true);
        setError({
          message: 'Company data not found.',
          action: 'redirectToCreateCompany',
        });
        return {company: null, quotations: [], workers: [], userData};
      }

      return {company, ...dashboardData, userData};
    } catch (err) {
      console.error('Failed to load data from Firestore cache:', err);
      setIsError(true);
      setError({message: 'Failed to load data from cache', action: 'retry'});
      return {company: null, quotations: [], workers: [], userData: null};
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
    refetch: fetchDashboardData,
    loadFromFirestoreCache,
  };
};

export default useFetchDashboard;
