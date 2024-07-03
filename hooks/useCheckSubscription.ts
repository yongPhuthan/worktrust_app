import { useState, useContext } from 'react';
import { Alert } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { Store } from '../redux/store';

type Subscription = {
  isActive: boolean;
};

const useCheckSubscription = () => {
  const {
    state: { G_subscription },
  } = useContext(Store);
  const [isVisible, setIsVisible] = useState(false);

  const checkSubscription = (): boolean => {
    try {
      if (!G_subscription?.isActive) {
        Alert.alert('แพคเกจหมดอายุ', 'กรุณาต่ออายุแพคเกจเพื่อใช้บริการ', [
          {
            text: 'ต่ออายุ',
            onPress: () => {
              setIsVisible(true);
            },
          },
          {
            text: 'ยกเลิก',
            onPress: () => {},
            style: 'cancel',
          },
        ]);
        return false;
      }
      return true;
    } catch (error) {
      // Log the error to Crashlytics
      crashlytics().recordError(error as Error);
      return false;
    }
  };

  return { isVisible, setIsVisible, checkSubscription };
};

export default useCheckSubscription;