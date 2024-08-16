import {useState, useEffect,  useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BACK_END_SERVER_URL} from '@env';
import {DashboardResponse} from '../../types';
import {QueryKeyType} from '../../types/enums';
import {useUser} from '../../providers/UserContext';
import {IDefaultStandards} from '../../models/DefaultStandards';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';

const useFetchStandard = () => {
  const user = useUser();
  const {
    dispatch,
    state: {companyId},
  } = useContext(Store);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const fetchStandardFromServer = async () => {
    console.log('FETCHING STANDARD FROM SERVER');
    if (!user) {
      setIsError(true);
      setError({message: 'User not authenticated.', action: 'logout'});
      setIsLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/getStandards?companyId=${encodeURIComponent(
          companyId.toString(),
        )}`,
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

      // Check if standard data is defined
      if (res.standards) {
        await AsyncStorage.setItem(
          QueryKeyType.STANDARD,
          JSON.stringify(res.standards),
        );
        dispatch(stateAction.get_standard(res.standards));

      } else {
        await AsyncStorage.removeItem(QueryKeyType.STANDARD);
        // setStandardData(res.standards);
        dispatch(stateAction.get_standard(res.standards));
      }

      setIsError(false);
    } catch (err) {
      console.error('An error occurred while fetching the standard:', err);
      setIsError(true);
      setError({message: 'Failed to fetch data', action: 'retry'});
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromAsyncStorage = async () => {
    try {
      const storedStandards = await AsyncStorage.getItem(QueryKeyType.STANDARD);

      if (storedStandards) {
        console.log('LOAD STANDARD FROM ASYNC STORAGE');
        const parsedStandards: IDefaultStandards[] = JSON.parse(storedStandards);
        console.log('Parsed standards:', parsedStandards);
        // setStandardData(parsedStandards);
        dispatch(stateAction.get_standard(parsedStandards));

      } else {
        fetchStandardFromServer(); // Fetch from server if async storage is empty
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
    // standardData,
    isLoading,
    isError,
    error,
    refetch: fetchStandardFromServer,
  };
};

export default useFetchStandard;
