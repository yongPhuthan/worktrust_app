import { useCallback } from 'react';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

function useThaiDateFormatter() {
  const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formatThaiDate = useCallback(
    (date: Date | number | string | FirebaseFirestoreTypes.Timestamp) => {
      let parsedDate: Date;
      if (date instanceof FirebaseFirestoreTypes.Timestamp) {
        parsedDate = date.toDate();
      } else {
        parsedDate = new Date(date);
      }
      return thaiDateFormatter.format(parsedDate);
    },
    [thaiDateFormatter]
  );

  return formatThaiDate;
}

export default useThaiDateFormatter;