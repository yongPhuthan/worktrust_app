import { useEffect, useState, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
const useStoragePermission = (onPermissionDenied: () => void) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false); // เพิ่ม state นี้

  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('You can use the storage');
          setHasPermission(true);
        } else {
          console.log('Storage permission denied');
          Alert.alert(
            'ให้สิทธิการเข้าถึงแกลลอรี่เพื่อจัดการรูปภาพผลงาน',
            'กรุณาเปิดให้สิทธิการเข้าถึงในตั้งค่า'
          );
          onPermissionDenied();
          setHasPermission(false);
        }
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
      }
    } else if (Platform.OS === 'ios') {
      // iOS specific permission handling
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

      if (result === RESULTS.GRANTED) {
        console.log('You can use the photo library');
        setHasPermission(true);
      } else {
        console.log('Photo library permission denied');
        Alert.alert(
          'ให้สิทธิการเข้าถึง photo library เพื่อเพิ่มโลโก้บริษัทในรูปภาพ',
          'กรุณาเปิดให้สิทธิการเข้าถึงในตั้งค่า',
          [
            {
              text: 'ยกเลิก',
              onPress: () => {
                onPermissionDenied();
                setHasPermission(false);
              },
              style: 'cancel',
            },
            {
              text: 'ตั้งค่า',
              onPress: () => {
                Linking.openURL('app-settings:');
                setHasPermission(false);
              },
            },
          ],
        );
      }
    }
  }, [onPermissionDenied]);

  useEffect(() => {
    if (!permissionRequested) {
      setPermissionRequested(true); // ตั้งค่าเมื่อทำการขอสิทธิ์แล้ว
      requestStoragePermission();
    }
  }, [requestStoragePermission, permissionRequested]);

  return { hasPermission, requestStoragePermission };
};

export default useStoragePermission;