import { BACK_END_SERVER_URL } from '@env';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useContext } from 'react';
import { CompanyQuery, SubmissionQuery } from 'types';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}


const useFetchSubmissions = (): UseQueryResult<SubmissionQuery, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();

  const fetchSubmissions = async (): Promise<SubmissionQuery> => {
    if (!user) {
      throw new Error('User not authenticated.');
    }

    const token = await user.getIdToken();

    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/submissions`,
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

  const queryKey: QueryKey = ['submissionsDashboard'];

  const queryOptions: UseQueryOptions<SubmissionQuery, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchSubmissions,
    retry: 3,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  };

  return useQuery<SubmissionQuery, ErrorResponse>(queryOptions);
};

export default useFetchSubmissions;
