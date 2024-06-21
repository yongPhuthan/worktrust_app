import { BACK_END_SERVER_URL } from '@env';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ReceiptsQuery } from 'types';
import { useUser } from '../../providers/UserContext';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}


const useFetchReceipts = (): UseQueryResult<ReceiptsQuery, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();

  const fetchReceipts = async (): Promise<ReceiptsQuery> => {
    if (!user) {
      throw new Error('User not authenticated.');
    }

    const token = await user.getIdToken();

    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/receipts`,
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
      queryClient.setQueryData(queryKey, {error: errorData});
      throw new Error(errorData.action);
    }

    const data = await response.json()
    return data;
  };

  const queryKey: QueryKey = ['dashboardReceipt'];

  const queryOptions: UseQueryOptions<ReceiptsQuery, ErrorResponse> = {
    queryKey: queryKey,
    
    queryFn: fetchReceipts,
    retry: 3,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  };

  return useQuery<ReceiptsQuery, ErrorResponse>(queryOptions);
};

export default useFetchReceipts;
