// /hooks/useFetchCompanyUser.js
import {BACK_END_SERVER_URL} from '@env';
import auth from '@react-native-firebase/auth';
import {useQuery} from '@tanstack/react-query';
import {useContext} from 'react';
import {useUser} from '../../../providers/UserContext';
import {Store} from '../../../redux/store';
import * as stateAction from '../../../redux/actions';

const useFetchDashboard = () => {
  const user = useUser();
  const {
    dispatch,
    state: {isEmulator, code},
  }: any = useContext(Store);

  const fetchDashboard = async (): Promise<any> => {
    if (!user) {
      await auth().signOut();
      throw new Error('ไม่พบบัญชีผู้ใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง');
    }
    const {uid} = user;
    if (!uid) {
      throw new Error('uid not found');
    }
    console.log('user:', user);
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
      const errorData = await response.json();
      throw new Error(errorData || 'An unknown error occurred');
    }

    const data = await response.json();
    if (data && Array.isArray(data[1])) {
      data[1].sort((a, b) => {
        const dateA = new Date(a.dateOffer);
        const dateB = new Date(b.dateOffer);
        return dateB.getTime() - dateA.getTime();
      });

      dispatch(stateAction.get_company_seller(data[0]));
      dispatch(stateAction.get_companyID(data[0].id));
      dispatch(stateAction.get_existing_services(data[2]));
    }
    return data;
  };
  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['dashboardQuotation', code],
    queryFn: fetchDashboard,
  });

  return {data, isLoading, isError, error};
};

export default useFetchDashboard;
