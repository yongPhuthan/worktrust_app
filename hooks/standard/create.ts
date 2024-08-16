import { BACK_END_SERVER_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { IDefaultStandards } from 'models/DefaultStandards';
import { useContext } from 'react';
import { useUser } from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import { Store } from '../../redux/store';
import { QueryKeyType } from '../../types/enums';
import { StandardSchemaType } from '../../models/validationSchema/standard';


// Pass actions via props
const useCreateStandard = () => {
    const { dispatch } = useContext(Store);
  
    const firebaseUser = useUser();
  
    if (!firebaseUser || !firebaseUser.uid) {
      console.error('User authentication failed: No user available');
      throw new Error('User is not authenticated');
    }
  
    const createStandard = async (standard: StandardSchemaType) => {
      if (!firebaseUser || !firebaseUser.uid) {
        throw new Error('User is not available');
      }
  
      const token = await firebaseUser.getIdToken(true);
      console.log('BACK_END_SERVER_URL', BACK_END_SERVER_URL);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/createStandard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ standard }),
        },
      );
  
      if (!response.ok) {
        const errorMsg = await response.text();
        console.error('Error from server:', errorMsg);
        throw new Error(errorMsg || 'Network response was not ok.');
      }
  
      const standardResponse = await response.json();
      console.log('Received response from server:', standardResponse);
      return standardResponse;
    };
  
    const mutation = useMutation({
      mutationFn: createStandard, // ensure this function expects StandardSchemaType as argument
      onSuccess: async (standardResponse: IDefaultStandards) => {
        console.log('Standard created successfully:', standardResponse);
  
        try {
          const standardStorage = await AsyncStorage.getItem(QueryKeyType.STANDARD);
          let standardData: IDefaultStandards[] = [];
  
          if (standardStorage) {
            try {
              standardData = JSON.parse(standardStorage);
            } catch (parseError) {
              console.error('Error parsing quotation data:', parseError);
              await AsyncStorage.removeItem(QueryKeyType.STANDARD);
              standardData = [];
            }
          }
  
          const existingStandard = standardData.find(
            q => q._id === standardResponse._id,
          );
          if (!existingStandard) {
            console.log('Adding new standard to the array.');
            standardData.push(standardResponse);
          } else {
            console.warn(
              'Standard already exists in the array:',
              existingStandard,
            );
          }
  
          const sortedStandard = standardData.sort((a, b) => {
            const dateA = new Date(a.updated || a.created || new Date());
            const dateB = new Date(b.updated || b.created || new Date());
            return dateB.getTime() - dateA.getTime();
          });
  
          await AsyncStorage.setItem(
            QueryKeyType.STANDARD,
            JSON.stringify(sortedStandard),
          );
          dispatch(stateAction.get_standard(sortedStandard));
          console.log('Updated AsyncStorage with new standard.');
        } catch (error) {
          console.error('Error updating AsyncStorage:', error);
        }
      },
      onError: (error: Error) => {
        console.error('Mutation error:', error.message);
      },
    });
  
    return mutation;
  };

export default useCreateStandard;
