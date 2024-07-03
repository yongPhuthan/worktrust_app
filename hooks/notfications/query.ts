import {BACK_END_SERVER_URL} from '@env';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {useContext} from 'react';
import {useUser} from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';
import {Company, Notifications, Quotations, Subscription} from '@prisma/client';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}

const useFetchNotifications = (): UseQueryResult<
  Notifications,
  ErrorResponse
> => {
  const user = useUser();
  const queryClient = useQueryClient();
  const {
    dispatch,
    state: {notifications},
  } = useContext(Store);

  const fetchNotifications = async (): Promise<Notifications> => {
    if (!user) {
      throw new Error('User not authenticated.');
    }
    const token = await user.getIdToken();

    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/queryNotifications`,
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
    console.log('data', data);
    dispatch(stateAction.get_notification(data));
    return data;
  };

  const queryKey: QueryKey = ['Notifications'];

  const queryOptions: UseQueryOptions<Notifications, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchNotifications,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  };

  return useQuery<Notifications, ErrorResponse>(queryOptions);
};

export default useFetchNotifications;
