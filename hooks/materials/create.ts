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
import { MaterialSchemaType } from 'models/validationSchema/material';
import { IDefaultMaterials } from 'models/DefaultMaterials';


// Pass actions via props
const useCreateMaterial = () => {
    const { dispatch } = useContext(Store);
  
    const firebaseUser = useUser();
  
    if (!firebaseUser || !firebaseUser.uid) {
      console.error('User authentication failed: No user available');
      throw new Error('User is not authenticated');
    }
  
    const createMaterial = async (material: MaterialSchemaType) => {
      if (!firebaseUser || !firebaseUser.uid) {
        throw new Error('User is not available');
      }
  
      const token = await firebaseUser.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/createMaterial`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ material }),
        },
      );
  
      if (!response.ok) {
        const errorMsg = await response.text();
        console.error('Error from server:', errorMsg);
        throw new Error(errorMsg || 'Network response was not ok.');
      }
  
      const materialResponse = await response.json();
      console.log('Received response from server:', materialResponse);
      return materialResponse;
    };
  
    const mutation = useMutation({
      mutationFn: createMaterial, // ensure this function expects StandardSchemaType as argument
      onSuccess: async (materialResponse: IDefaultMaterials) => {
        console.log('Standard created successfully:', materialResponse);
  
        try {
          const materialStorage = await AsyncStorage.getItem(QueryKeyType.MATERIAL);
          let MaterialData: IDefaultMaterials[] = [];
  
          if (materialStorage) {
            try {
              MaterialData = JSON.parse(materialStorage);
            } catch (parseError) {
              console.error('Error parsing quotation data:', parseError);
              await AsyncStorage.removeItem(QueryKeyType.MATERIAL);
              MaterialData = [];
            }
          }
  
          const existingMaterial = MaterialData.find(
            q => q._id === materialResponse._id,
          );
          if (!existingMaterial) {
            console.log('Adding new material to the array.');
            MaterialData.push(materialResponse);
          } else {
            console.warn(
              'Material already exists in the array:',
              existingMaterial,
            );
          }
  
          const sortedMaterial = MaterialData.sort((a, b) => {
            const dateA = new Date(a.updated || a.created || new Date());
            const dateB = new Date(b.updated || b.created || new Date());
            return dateB.getTime() - dateA.getTime();
          });
  
          await AsyncStorage.setItem(
            QueryKeyType.MATERIAL,
            JSON.stringify(sortedMaterial),
          );
          dispatch(stateAction.get_material(sortedMaterial));
          console.log('Updated AsyncStorage with new material.');
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

export default useCreateMaterial;
