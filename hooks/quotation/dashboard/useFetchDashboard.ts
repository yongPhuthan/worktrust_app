import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BACK_END_SERVER_URL} from '@env';
import {DashboardResponse} from '../../../types';
import {QueryKeyType} from '../../../types/enums';
import {useUser} from '../../../providers/UserContext';
import {IQuotations} from 'models/Quotations';

const useFetchDashboard = () => {
  const user = useUser();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [quotationsData, setQuotationsData] = useState<IQuotations[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const fetchDashboardFromServer = async () => {
    console.log('FETCHING DATA FROM SERVER');
    if (!user) {
      setIsError(true);
      setError({message: 'User not authenticated.', action: 'logout'});
      setIsLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/dashboard/quotations`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData: any = await response.json();
        console.log('Error fetching data:', errorData);
        setIsError(true);
        setError(errorData);
        setIsLoading(false);
        return;
      }

      const res: any = await response.json();

      // console.log('quotations:', quotations ? quotations : 'No quotations data');
      console.log('DATA SAVED TO ASYNC STORAGE');

      // Check if quotations data is defined
      if (res.quotations) {
        await AsyncStorage.setItem(
          QueryKeyType.QUOTATIONS,
          JSON.stringify(res.quotations),
        );
      } else {
        await AsyncStorage.removeItem(QueryKeyType.QUOTATIONS);
        setQuotationsData(res.quotations);
      }
      if (res.dashboard) {
        await AsyncStorage.setItem(
          QueryKeyType.DASHBOARD,
          JSON.stringify(res.dashboard),
        );
      } else {
        await AsyncStorage.removeItem(QueryKeyType.DASHBOARD);
        setDashboard(res.dashboard);
      }

      setIsError(false);
    } catch (err) {
      console.error('An error occurred while fetching the dashboard:', err);
      setIsError(true);
      setError({message: 'Failed to fetch data', action: 'retry'});
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromAsyncStorage = async () => {
    try {
      const storedData = await AsyncStorage.getItem(QueryKeyType.DASHBOARD);
      const storedQuotations = await AsyncStorage.getItem(
        QueryKeyType.QUOTATIONS,
      );

      if (storedData && storedQuotations) {
        console.log('LOAD FROM ASYNC STORAGE');
        const parsedData: DashboardResponse = JSON.parse(storedData);
        const parsedQuotations: IQuotations[] = JSON.parse(storedQuotations);
        setDashboard(parsedData); // Set the data to async storage data initially
        setQuotationsData(parsedQuotations);
      } else {
        fetchDashboardFromServer(); // Fetch from server if async storage is empty
      }
    } catch (err) {
      console.error('Failed to load data from AsyncStorage:', err);
      setIsError(true);
      setError({message: 'Failed to load data from storage', action: 'retry'});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFromAsyncStorage(); // Load data from AsyncStorage on component mount
  }, []);

  return {
    dashboard,
    quotationsData,
    isLoading,
    isError,
    error,
    refetch: fetchDashboardFromServer,
  };
};

export default useFetchDashboard;
