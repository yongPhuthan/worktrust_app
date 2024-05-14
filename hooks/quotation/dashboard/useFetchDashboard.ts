// /hooks/useFetchCompanyUser.js
import { BACK_END_SERVER_URL } from '@env';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useContext } from 'react';
import { useUser } from '../../../providers/UserContext';
import * as stateAction from '../../../redux/actions';
import { Store } from '../../../redux/store';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}

type DashboardData = any;
const useFetchDashboard = (): UseQueryResult<DashboardData, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();
  const {
    dispatch,
    state: {code},
  }: any = useContext(Store);
  const fetchDashboard = async (): Promise<DashboardData> => {
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
      const errorData: ErrorResponse = await response.json();
      queryClient.setQueryData(queryKey, {error: errorData}); // Custom handling
      throw new Error(errorData.action);
    }
    const data = await response.json();
    if (data && data.length > 0) {
      // If data[0] exists and has a non-null `code`, proceed with your logic
      dispatch(stateAction.code_company(data[0].code));
      dispatch(stateAction.get_companyID(data[0].id));
      dispatch(stateAction.get_logo(data[0].logo));
      dispatch(stateAction.get_company_state(data[0]));

      if (data[1] && data[1].length > 0) {
        dispatch(stateAction.get_existing_services(data[2]));
      }
      if (data[3] && data[3].length > 0) {
        const {id, ...restOfData} = data[3];
        dispatch(stateAction.get_default_contract(restOfData));
      }
      if (data[4] && data[4].length > 0) {
        const {id, ...restOfData} = data[4];
        dispatch(stateAction.get_default_warranty(restOfData));
      }
      if (data[5] && data[5].length > 0) {
        dispatch(stateAction.get_existing_workers(data[5]));
      }
      if (data[6]) {
        dispatch(stateAction.get_user_signature(data[6]));
      }
    }
    return data;
  };

  const queryKey: QueryKey = ['dashboardData']; // This can be more dynamic based on user or other parameters

  const queryOptions: UseQueryOptions<DashboardData, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchDashboard,
    retry: 3,
    staleTime: 5 * 60 * 1000, // Data is considered stale after 5 minutes
    enabled: !!user, // Only run the query if the user is authenticated
  };

  return useQuery<DashboardData, ErrorResponse>(queryOptions);
};

export default useFetchDashboard;
