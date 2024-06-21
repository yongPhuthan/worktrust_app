import { BACK_END_SERVER_URL } from '@env';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { InvoiceQuery } from 'types';
import { useUser } from '../../providers/UserContext';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}


const useFetchInvoices = (): UseQueryResult<InvoiceQuery, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();


  const fetchInvoices = async (): Promise<InvoiceQuery> => {
    if (!user) {
      throw new Error('User not authenticated.');
    }

    const token = await user.getIdToken();

    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/invoices`,
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

    const data = await response.json();

    return data;
  };

  const queryKey: QueryKey = ['dashboardInvoice'];

  const queryOptions: UseQueryOptions<InvoiceQuery, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchInvoices,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  };

  return useQuery<InvoiceQuery, ErrorResponse>(queryOptions);
};

export default useFetchInvoices;
