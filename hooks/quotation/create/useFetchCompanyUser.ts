// /hooks/useFetchCompanyUser.js
import {useQuery} from '@tanstack/react-query';
import {useUser} from '../../../providers/UserContext';
import {CompanySeller} from '../../../types/docType';
import {BACK_END_SERVER_URL} from '@env';

const useFetchCompanyUser = () => {
  const user = useUser();

  const fetchCompanyUser = async (): Promise<CompanySeller> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
console.log('user:', user);
    const idToken = await user.getIdToken(true);
    const { uid} = user;
    if (!uid) {
      throw new Error('uid not found');
    }
    const url = `${BACK_END_SERVER_URL}/api/company/getCompanySeller`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Optionally handle Firebase Messaging token logic here if needed

    return data;
  };

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['companyUser', user?.uid],
    queryFn: fetchCompanyUser,
  });

  return {data, isLoading, isError, error};
};

export default useFetchCompanyUser;
