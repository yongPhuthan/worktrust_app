// /hooks/useFetchCompanyUser.js
import {useQuery} from '@tanstack/react-query';
import {useUser} from '../../providers/UserContext';
import {BACK_END_SERVER_URL} from '@env';
const useFetchDashboardReceipt = () => {
  const user = useUser();

  const fetchDashboardReceipts = async (): Promise<any> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken(true);
    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/queryDashboardReceipt`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (data && Array.isArray(data[1])) {
      data[1].sort((a, b) => {
        const dateA = new Date(a.dateOffer);
        const dateB = new Date(b.dateOffer);
        return dateB.getTime() - dateA.getTime();
      });
    }
    if(!data) throw new Error('No data found')
    console.log('DATA', data)
    return data;
  };

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['dashboardInvoice'],
    queryFn: fetchDashboardReceipts,
    enabled: !!user,
    retry: 3,
  });

  return {data, isLoading, isError, error};
};

export default useFetchDashboardReceipt;
