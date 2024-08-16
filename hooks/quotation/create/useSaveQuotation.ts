import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useUser} from '../../../providers/UserContext';
import {BACK_END_SERVER_URL} from '@env';
import {CompanyState, DashboardResponse} from '../../../types';
import {IQuotations} from '../../../models/Quotations';
import {QueryKeyType} from '../../../types/enums';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IUser} from 'models/User';
import {ISubscription} from 'models/Subscription';
import useFetchDashboard from '../dashboard/useFetchDashboard';
import * as stateAction from '../../../redux/actions';
import {Store} from '../../../redux/store';
import {useContext} from 'react';
export interface QuotationActions {
  setQuotationServerId: (id: string) => void;
  setPdfUrl: (url: string) => void;
  openProjectModal: () => void;
}

// Pass actions via props
const useCreateQuotation = (actions: QuotationActions) => {
  const {setQuotationServerId, setPdfUrl, openProjectModal} = actions;
  const {dispatch} = useContext(Store);

  const firebaseUser = useUser();

  if (!firebaseUser || !firebaseUser.uid) {
    console.error('User authentication failed: No user available');
    throw new Error('User is not authenticated');
  }

  const createQuotation = async (
    quotation: IQuotations,
    company: CompanyState,
    user: IUser,
  ) => {
    if (!firebaseUser || !firebaseUser.uid) {
      throw new Error('User is not available');
    }

    console.log('Creating quotation with data:', {quotation, company, user});

    const token = await firebaseUser.getIdToken(true);
    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/docs/createQuotation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({quotation, company, user}),
      },
    );

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error('Error from server:', errorMsg);
      throw new Error(errorMsg || 'Network response was not ok.');
    }

    const responseData = await response.json();
    console.log('Received response from server:', responseData);
    return responseData;
  };

  const mutation = useMutation({
    mutationFn: async (data: {
      quotation: IQuotations;
      company: CompanyState;
      user: IUser;
    }) => {
      console.log('Mutate function called with data:', data);
      return createQuotation(data.quotation, data.company, data.user);
    },
    onSuccess: async (responseData: any) => {
      console.log('Quotation created successfully:', responseData);
      setQuotationServerId(responseData.quotationId);
      setPdfUrl(responseData.pdfUrl);

      openProjectModal();

      try {
        console.log('Attempting to load dashboard data from AsyncStorage...');
        const quotationStorage = await AsyncStorage.getItem(
          QueryKeyType.QUOTATIONS,
        );
        let quotationData: IQuotations[] = [];

        if (quotationStorage) {
          try {
            quotationData = JSON.parse(quotationStorage);
          } catch (parseError) {
            console.error('Error parsing quotation data:', parseError);
            await AsyncStorage.removeItem(QueryKeyType.QUOTATIONS);
            quotationData = [];
          }
        }

        const existingQuotation = quotationData.find(
          q => q._id === responseData.quotation._id,
        );
        if (!existingQuotation) {
          console.log('Adding new quotation to the array.');
          quotationData.push(responseData.quotation);
        } else {
          console.warn(
            'Quotation already exists in the array:',
            existingQuotation,
          );
        }

        const sortedQuotations = quotationData.sort((a, b) => {
          const dateA = new Date(a.updated || a.created || new Date());
          const dateB = new Date(b.updated || b.created || new Date());
          return dateB.getTime() - dateA.getTime();
        });

        console.log('Sorted quotations:', sortedQuotations);

        await AsyncStorage.setItem(
          QueryKeyType.QUOTATIONS,
          JSON.stringify(sortedQuotations),
        );
        dispatch(stateAction.get_quotations(sortedQuotations));
        const services = sortedQuotations.flatMap((quotation: IQuotations) =>
          quotation.services.slice(0, 10),
        );
        if (services) {
          dispatch(stateAction.get_existing_services(services));
        }

        console.log('Updated AsyncStorage with new quotations.');
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

export default useCreateQuotation;
