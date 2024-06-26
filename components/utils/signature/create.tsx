// SignatureComponent.js
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import FastImage from 'react-native-fast-image';
import {v4 as uuidv4} from 'uuid';
import firebase from '../../../firebase';
import * as stateAction from '../../../redux/actions';
import storage from '@react-native-firebase/storage';

import {BACK_END_SERVER_URL} from '@env';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useFormContext, useWatch} from 'react-hook-form';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ActivityIndicator, Button} from 'react-native-paper';
import Signature from 'react-native-signature-canvas';
import {useUser} from '../../../providers/UserContext';
import {Store} from '../../../redux/store';
import {useUploadToFirebase} from '../../../hooks/useUploadtoFirebase';
interface SignaturePadProps {
  setSignatureUrl: React.Dispatch<React.SetStateAction<string | null>>;
  onSignatureSuccess?: () => void;
  onClose: () => void;
  setLoadingWebP: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignatureComponent = ({
  onSignatureSuccess,
  setSignatureUrl,
setLoadingWebP,
  onClose,
}: SignaturePadProps) => {
  const ref = useRef<any>();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const queryClient = useQueryClient();
  const [createNewSignature, setCreateNewSignature] = useState<boolean>(false);
  const imageId = uuidv4();
  const user = useUser();
  const [isSignatureUpload, setIsSignatureUpload] = useState<boolean>(false);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context;
  const {
    state: {code, userSignature},
    dispatch,
  }: any = useContext(Store);

  const filename = `signature${code}${imageId}.png`;
  const storagePath = `${code}/signature/${filename}`;

const getSinature = async () => {
  const signaturePath = `${code}/signature`;
  const storageRef = firebase.firestore().collection(signaturePath)
  try {
    const imageSnapshot = await storageRef.get();
    const images = imageSnapshot.docs.map(doc => {
      const data = doc.data();
      return data;
    });

    return images; 
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return null
  }
}

  const updateUserSignature = async (data: any) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/updateUserSignature`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json(); // Parse the error response only if it's JSON
          throw new Error(errorData.message || 'Network response was not ok.');
        } else {
          const text = await response.text(); // Read the response as text
          throw new Error(
            `Network response was not ok and not JSON. Response: ${text}`,
          );
        }
      }



      return response.json();
    } catch (err) {
      console.error('Error in updateContractAndQuotation:', err);
      throw new Error(
        err instanceof Error ? err.message : 'Unknown error occurred',
      );
    }
  };

  const {mutate, isPending} = useMutation({
    mutationFn: updateUserSignature,
    onError: (error: any) => {
      Alert.alert(
        'Update Error',
        `Server-side user creation failed: ${error.message}`,
        [{text: 'OK'}],
        {cancelable: false},
      );
    },
    onSuccess: () => {
      console.log('User signature updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['userSignature'],
      });
    }
  });

  const sellerSignature = useWatch({
    control: control,
    name: 'sellerSignature',
  });

  const uploadFileToFirebase = useCallback(
    async (imageUri: string): Promise<string | null> => {
      setIsSignatureUpload(true);

      if (!user) {
        console.error('User is not authenticated');
        setIsSignatureUpload(false);
        return null;
      }

      if (!user.uid) {
        console.error('User UID is not available');
        setIsSignatureUpload(false);
        return null;
      }

      try {
        const storageRef = storage().ref(storagePath);

        const base64String = imageUri.split(',')[1];

        const snapshot = await storageRef.putString(base64String, 'base64', {
          contentType: 'image/png',
        });

        if (!snapshot.metadata) {
          console.error('Snapshot metadata is undefined');
          return null;
        }
        // Use getDownloadURL to get the URL for the uploaded file
        const downloadUrl = await storageRef.getDownloadURL();
        const webpDownloadURL = downloadUrl.replace('.png', '.webp');

        console.log('File uploaded successfully. URL:', webpDownloadURL);

        return webpDownloadURL;
      } catch (error) {
        console.error('Error uploading file to Firebase:', error);
        return null;
      } finally {
        setIsSignatureUpload(false);
      }
    },
    [user, code, imageId],
  );

  const handleUploadNewSignatureAndSave = useCallback(
    async (signature: string) => {
      if (!signature) {
        return;
      }

      try {
        setIsImageUpload(true);
        const imageUrl = await uploadFileToFirebase(signature);
        if (!imageUrl) {
          console.error('Image upload returned null or undefined.');
          return;
        }

        mutate(imageUrl);
        dispatch(stateAction.get_user_signature(imageUrl));
        setLoadingWebP(true)  ;
        setValue('sellerSignature', imageUrl, {shouldDirty: true});
        setCreateNewSignature(false);
      } catch (error: any) {
        Alert.alert(
          'Upload Error',
          `An error occurred during the upload: ${error.message}`,
          [{text: 'OK'}],
          {cancelable: false},
        );
      } finally {
        setIsImageUpload(false);
        onClose();
      }
    },
    [mutate, setValue, setCreateNewSignature, onClose],
  );
  const handleBegin = () => {
    setIsSigned(true);
  };
  const handleSave = (signatureUrl: string) => {
    setValue('sellerSignature', signatureUrl, {shouldDirty: true});
    setCreateNewSignature(false);
    onClose();
  };

  useEffect(() => {
    if (userSignature === 'none' || null || '' || !userSignature) {
      setCreateNewSignature(true);
    }
  }, [userSignature, setValue, sellerSignature]);

  useEffect(() => {
    if (userSignature) {
      Image.prefetch(userSignature)
        .then(() => console.log('Image prefetched!'))
        .catch(error => console.error('Error prefetching image:', error));
    }
  }, [userSignature]);


  const style = `.m-signature-pad--footer {display: none; margin: 0px;} 
  
  .m-signature-pad--body {border: 1px solid #000;}
  
  `;
  const handleClear = () => {
    setIsSigned(false);

    ref.current.clearSignature();
  };

  const handleConfirm = () => {
    ref.current.readSignature();
  };
  // if(error) {
  //   console.error('Error fetching signature:', error);
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text>เกิดข้อผิดพลาดในการดึงลายเซ็น</Text>
  //     </View>
  //   );
  // }
  return (
    <>
      {isSignatureUpload || isPending ? (
        <ActivityIndicator style={styles.loadingContainer} size="large" />
      ) : !createNewSignature ? (
        <>
          <View style={styles.containerExist}>
            <View style={styles.textContainer}>
              <View style={styles.underline} />

              {userSignature && (
       
                <FastImage
                  style={styles.image}
                  source={{
                    uri: userSignature,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.web,
                  }}
                />
              )}

              <Button
              mode='contained'
                onPress={() => handleSave(userSignature)}
                >
                <Text style={styles.label}>ใช้ลายเซ็นเดิม</Text>
              </Button>
            </View>
          </View>
          <View style={styles.orContainer}>
            <Text style={styles.orText}>หรือ</Text>

            <TouchableOpacity
              onPress={
                () => setCreateNewSignature(true)
                // setValue('companyUser.signature', '', {shouldDirty: true})
              }>
              <Text style={styles.textLink}>เปลี่ยนลายเซ็นใหม่</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <View>
            <Signature
              penColor="#0000FF"
              webStyle={style}
              onBegin={handleBegin}
              style={{width: 300, height: 200}}
              ref={ref}
              onOK={img => handleUploadNewSignatureAndSave(img)}
              onEmpty={() => console.log('Empty')}
              descriptionText="เซ็นเอกสารด้านบน"
            />
          </View>

          <View style={styles.row}>
            <Button mode="outlined" icon="autorenew" onPress={handleClear}>
              เซ็นใหม่
            </Button>
            <Button
              mode="contained"
              disabled={!isSigned}
              icon="check-bold"
              onPress={handleConfirm}>
              บันทึก
            </Button>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  containerExist: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
    padding: 10,
  },

  underline: {
    height: 1,
    flex: 1,
    backgroundColor: 'grey',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  image: {
    width: 230,
    height: 250,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 40,
    backgroundColor: '#0073BA',
  },
  textLink: {
    color: '#0073BA',
    // textDecorationLine: 'underline',

    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignItems: 'center',
  },
});

export default SignatureComponent;
