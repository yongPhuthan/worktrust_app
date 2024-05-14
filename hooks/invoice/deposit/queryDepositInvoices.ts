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
import { Store } from '../../../redux/store';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}

type useFetchDepositInvoices = any;
const useFetchDepositInvoices = (): UseQueryResult<useFetchDepositInvoices, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();
  const {
    dispatch,
    state: {code},
  }: any = useContext(Store);
  const fetchDepositInvoicesDashboard = async (): Promise<useFetchDepositInvoices> => {
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

    return data;
  };

  const queryKey: QueryKey = ['dashboardData']; // This can be more dynamic based on user or other parameters

  const queryOptions: UseQueryOptions<useFetchDepositInvoices, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchDepositInvoicesDashboard,
    retry: 3,
    staleTime: 5 * 60 * 1000, // Data is considered stale after 5 minutes
    enabled: !!user, // Only run the query if the user is authenticated
  };

  return useQuery<useFetchDepositInvoices, ErrorResponse>(queryOptions);
};

export default useFetchDepositInvoices;
