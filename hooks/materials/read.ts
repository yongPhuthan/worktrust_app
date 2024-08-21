import {useState, useEffect,  useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BACK_END_SERVER_URL} from '@env';
import {DashboardResponse} from '../../types';
import {QueryKeyType} from '../../types/enums';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import { IMaterials } from 'models/DefaultMaterials';
import * as stateAction from '../../redux/actions';

const useFetchMaterial = () => {
  const user = useUser();
  const {
    dispatch,
    state: {companyId},
  } = useContext(Store);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const fetchMaterialFromServer = async () => {
    console.log('FETCHING MATERIAL FROM SERVER');
    if (!user) {
      setIsError(true);
      setError({message: 'User not authenticated.', action: 'logout'});
      setIsLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/getMaterials?companyId=${encodeURIComponent(
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

      console.log('DATA SAVED TO ASYNC STORAGE');

      if (res.materials) {
        await AsyncStorage.setItem(
          QueryKeyType.MATERIAL,
          JSON.stringify(res.materials),
        );
        dispatch(stateAction.get_material(res.materials));
      } else {
        await AsyncStorage.removeItem(QueryKeyType.MATERIAL);
        dispatch(stateAction.get_material(res.materials));

      }

      setIsError(false);
    } catch (err) {
      console.error('An error occurred while fetching the material:', err);
      setIsError(true);
      setError({message: 'Failed to fetch data', action: 'retry'});
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromAsyncStorage = async () => {
    try {
      const storedMaterials = await AsyncStorage.getItem(QueryKeyType.MATERIAL);

      if (storedMaterials) {
        console.log('LOAD FROM ASYNC STORAGE');
        const parsedMaterials: IMaterials[] = JSON.parse(storedMaterials);
        dispatch(stateAction.get_material(parsedMaterials));

      } else {
        fetchMaterialFromServer(); // Fetch from server if async storage is empty
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
    isLoading,
    isError,
    error,
    refetch: fetchMaterialFromServer,
  };
};

export default useFetchMaterial;
