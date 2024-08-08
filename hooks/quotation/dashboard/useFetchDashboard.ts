import {BACK_END_SERVER_URL} from '@env';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {useContext} from 'react';
import {useUser} from '../../../providers/UserContext';
import * as stateAction from '../../../redux/actions';
import {Store} from '../../../redux/store';
import {CompanyQuery} from '../../../types';
import { IQuotations } from 'models/Quotations';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}

const useFetchDashboard = (): UseQueryResult<CompanyQuery, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();
  const {
    dispatch,
    state: {code},
  } = useContext(Store);

  const fetchDashboard = async (): Promise<CompanyQuery> => {
    if (!user) {
      throw new Error('User not authenticated.');
    }
    const token = await user.getIdToken();

    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/dashboard`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      console.error('Error from server:', response.statusText);
      const errorData: ErrorResponse = await response.json();
      queryClient.setQueryData(queryKey, {error: errorData});
      throw new Error(errorData.action);
    }

    const data = await response.json();
    const quotations = data.company.quotations;
    const services = quotations.flatMap((quotation: IQuotations) =>
      quotation.services.slice(0, 10),
    );
    dispatch(stateAction.code_company(data.company.code));
    dispatch(stateAction.get_logo(data.company.logo));
    dispatch(stateAction.get_default_warranty(data.company.defaultWarranty));
    dispatch(stateAction.get_notification(data.notifications));
    dispatch(stateAction.get_existing_workers(data.company.workers));
    dispatch(stateAction.get_existing_services(services));
    dispatch(stateAction.get_user_signature(data.user.signature));
    dispatch(stateAction.get_seller_uid(data.user.id));
    dispatch(stateAction.get_subscription(data.subscription));
    dispatch(stateAction.get_user(data.user));

    return data;
  };

  const queryKey: QueryKey = ['dashboardData'];

  const queryOptions: UseQueryOptions<CompanyQuery, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchDashboard,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  };

  return useQuery<CompanyQuery, ErrorResponse>(queryOptions);
};

export default useFetchDashboard;
