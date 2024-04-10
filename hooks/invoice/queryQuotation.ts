// /hooks/useFetchCompanyUser.js
import {useQuery} from '@tanstack/react-query';
import {useUser} from '../../providers/UserContext';
import {CompanyUser} from '../../types/docType';
import {BACK_END_SERVER_URL} from '@env';
const useFetchDashboardInvoice = () => {
  const user = useUser();

  const fetchDashboardInvoice = async (): Promise<any> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const {email} = user;
    if (!email) {
      throw new Error('Email not found');
    }
    const token = await user.getIdToken(true);
    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/dashboardInvoice?email=${encodeURIComponent(
        email,
      )}`,
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
    return data;
  };

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['dashboardInvoice', user?.email],
    queryFn: fetchDashboardInvoice,
  });

  return {data, isLoading, isError, error};
};

export default useFetchDashboardInvoice;
