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

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}

type DashboardData = any;

const useFetchDashboard = (): UseQueryResult<DashboardData, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();
  const { dispatch, state: { code } } = useContext(Store);

  const fetchDashboard = async (): Promise<DashboardData> => {
    if (!user) {
      throw new Error('User not authenticated.');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${BACK_END_SERVER_URL}/api/dashboard/dashboard`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      queryClient.setQueryData(queryKey, { error: errorData });
      throw new Error(errorData.action);
    }

    const data = await response.json();
    console.log('data', data);
    if (data && data.length > 0) {
      const [
        companyData, , , defaultContract, defaultWarranty, workers, userSignature, sellerId
      ] = data;

      dispatch(stateAction.code_company(companyData.code));
      dispatch(stateAction.get_companyID(companyData.id));
      dispatch(stateAction.get_logo(companyData.logo));
      dispatch(stateAction.get_company_state(companyData));

      if (data[2] && data[2].length > 0) {
        const services = data[2].flatMap((item: any) => item.services);
        dispatch(stateAction.get_existing_services(services));
      }
      if (defaultContract) {
        dispatch(stateAction.get_default_contract(defaultContract));
      }
      if (defaultWarranty) {
        const {companyId,...restData} = defaultWarranty;
        dispatch(stateAction.get_default_warranty(restData));
      }
      if (workers && workers.length > 0) {
        dispatch(stateAction.get_existing_workers(workers));
      }
      if (userSignature) {
        dispatch(stateAction.get_user_signature(userSignature));
      }
      if (sellerId) {
        dispatch(stateAction.get_seller_id(sellerId));
      }
    }

    return data;
  };

  const queryKey: QueryKey = ['dashboardData'];

  const queryOptions: UseQueryOptions<DashboardData, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchDashboard,
    retry: 3,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  };

  return useQuery<DashboardData, ErrorResponse>(queryOptions);
};

export default useFetchDashboard;
