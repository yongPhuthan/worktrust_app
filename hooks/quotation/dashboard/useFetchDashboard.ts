// /hooks/useFetchCompanyUser.js
import {useQuery} from '@tanstack/react-query';
import {useUser} from '../../../providers/UserContext';
import {CompanyUser} from '../../../types/docType';
import {BACK_END_SERVER_URL} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

const useFetchDashboard = () => {
  const user = useUser();

  const fetchDashboard = async (): Promise<any> => {
    if (!user) {
      await auth().signOut();
      throw new Error('ไม่พบบัญชีผู้ใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง');
    }

    const {phoneNumber} = user 
    if (!phoneNumber) {
      throw new Error('Email not found');
    }
    const token = await user.getIdToken(true);
    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/dashboard?email=${encodeURIComponent(
        phoneNumber,
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
      return Promise.reject('พบข้อผิดพลาดในการดึงข้อมูล');
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
    queryKey: ['dashboardQuotation', user?.uid],
    queryFn: fetchDashboard,
  });

  return {data, isLoading, isError, error};
};

export default useFetchDashboard;
