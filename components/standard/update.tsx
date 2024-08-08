import { BACK_END_SERVER_URL } from '@env';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useContext } from 'react';
import { Store } from '../../redux/store';

import { IDefaultStandards } from '../../models/DefaultStandards';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Appbar,
  Button,
  Divider,
  Text,
  TextInput
} from 'react-native-paper';
import UploadImage from '../../components/ui/UploadImage';
import { usePutServer } from '../../hooks/standard/update';
import { useUploadToCloudflare } from '../../hooks/useUploadtoCloudflare';
import { usePickImage } from '../../hooks/utils/image/usePickImage';

import { useUser } from '../../providers/UserContext';
import { defaulatStandardSchema } from '../../models/validationSchema';

type Props = {
    onClose: () => void;
  standard : IDefaultStandards;
};

const UpdateStandard = (props: Props) => {
  const { standard, onClose} = props;
  const user = useUser();

  const {
    state: {code, companyId},
    dispatch,
  } = useContext(Store);
  const {width, height} = Dimensions.get('window');
  const [isError, setError] = React.useState('');
  const queryClient = useQueryClient();

  const {
    register,
    control,
    setValue,
    getValues,
    formState: {errors, isValid,isDirty},
  } = useForm<IDefaultStandards>({
    mode: 'onChange',
    defaultValues: standard,
    resolver: yupResolver(defaulatStandardSchema),
  });

  const image = useWatch({
    control,
    name: 'image',
  });
  const badStandardImage = useWatch({
    control,
    name: 'badStandardImage',
  });
  const {
    isImagePicking: isStandardImageUploading,
    pickImage: pickStandardImage,
  } = usePickImage((uri: string) => {
    setValue('image', uri, {shouldDirty: true});
  });

  const {
    isImagePicking: isBadStandardImageUploading,
    pickImage: pickBadStandardImage,
  } = usePickImage((uri: string) => {
    setValue('badStandardImage', uri, {shouldDirty: true});
  });

  const standardStoragePath = `${code}/standards/${getValues(
    'standardShowTitle',
  )}`;
  const {
    isUploading: isStandardUploading,
    error: isStandardImageError,
    uploadImage: uploadStandardImage,
  } = useUploadToCloudflare(
    code, 'standards'
  );
  const badStandardStoragePath = `${code}/badStandard/${getValues(
    'standardShowTitle',
  )}/badStandard`;
  const {
    isUploading: isBadStandardUploading,
    error: isBadStandardImageError,
    uploadImage: uploadBadStandardImage,
  } = useUploadToCloudFlare(
    code, 'badStandard'
  );

  const url = `${BACK_END_SERVER_URL}/api/company/updateStandard`;
  const {isLoading, error, putToServer} = usePutServer(
    url,
    'standards',
  );
  const updateStandard = useCallback(async () => {
    if (!user || !user.uid ) {
      console.error('User  error');
      return;
    }

    try {
      if (isDirty) {
        if ( image && image !== standard.image) {
          const downloadUrl = await uploadStandardImage(image);
          if (!downloadUrl) {
            throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
          }
          setValue('image', downloadUrl.originalUrl as string, {
            shouldDirty: true,
          });
        }
        if (badStandardImage && badStandardImage !== standard.badStandardImage) {
          const downloadUrl = await uploadBadStandardImage(badStandardImage);
          if (!downloadUrl) {
            throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
          }
          setValue('badStandardImage', downloadUrl.originalUrl as string, {
            shouldDirty: true,
          });
        }
        const formData = getValues();
        await putToServer(formData);
        onClose();
      } else {
        console.log('No changes to save');
      }
    } catch (err) {
      console.error('An error occurred:', err);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'An error occurred while updating the worker. Please try again.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    }
  }, [
    user,
    isValid,
    image,
    standard.image,
    isDirty,
    setValue,
    getValues,
    uploadStandardImage,
    uploadBadStandardImage,
    putToServer,
    onClose,
  ]);
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={onClose} />

        <Appbar.Content
          title={`แก้ไขมาตรฐาน`}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <Button
          loading={isBadStandardUploading || isStandardUploading || isLoading}
          disabled={!isDirty || isLoading || isStandardUploading || isBadStandardUploading}
          testID="submited-button"
          mode="contained"
          onPress={() => {
            updateStandard();
          }}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <ScrollView>
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 30,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignContent: 'center',
            
    
          }}>
           
          <Text
            variant="titleLarge"
            style={{
              fontFamily: 'Sukhumvit set',
              fontWeight: 'bold',
              marginBottom: 10,
            }}>
            มาตรฐานของคุณ
          </Text>

          {/* <Text style={{marginBottom: 10}}>ชื่อมาตรฐาน</Text> */}
          <View style={{
             flexDirection: 'column',
             justifyContent: 'space-between',
             alignContent: 'center',
             gap: 20,
          }}>

   
          <Controller
            control={control}
            name="standardShowTitle"

            render={({
              field: {onChange, value, onBlur},
              fieldState: {error},
            }) => (
              <View>
                <TextInput
                  mode="outlined"
                  onBlur={onBlur}
                  error={!!error}
                  label={'ชื่อมาตรฐาน'}
                  placeholder="เช่น การป้องกันน้ำรั่วซึม..."
                  value={value || ''}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
        <UploadImage
            width={width * 0.6}
            height={width * 0.6}
            control={control}
            name="image"
            isUploading={isStandardImageUploading}
            pickImage={pickStandardImage}
            label="อัพโหลดภาพมาตรฐานของคุณ"
          />
          {/* <Text style={{marginBottom: 10}}>รายละเอียด</Text> */}
          <Controller
            control={control}
            name="content"
            render={({
              field: {onChange, value, onBlur},
              fieldState: {error},
            }) => (
              <View>
                <TextInput
                  mode="outlined"
                  numberOfLines={5}
                  multiline={true}
                  onBlur={onBlur}
                  error={!!error}
                  style={
                    Platform.OS === 'ios'
                      ? {height: 100, textAlignVertical: 'top'}
                      : {}
                  }
                  placeholder="อธิบายประโยชน์ที่ลูกค้าได้รับจากมาตรฐานการทำงานนี้..."
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
        </View>
        </View>
        <Divider
          style={{
            width: '90%',
            alignSelf: 'center',
          }}
        />
        <View
          style={{
            // backgroundColor: '#dddddd',
            paddingHorizontal: 20,
            paddingVertical: 20,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignContent: 'center',
            paddingBottom: 30,
            marginBottom: 30,
          }}>
          <Text
            variant="titleLarge"
            style={{
              marginBottom: 10,
              fontFamily: 'Sukhumvit set',
              fontWeight: 'bold',
              lineHeight: 30,
            }}>
            ตัวอย่างงานที่ไม่ได้มาตรฐาน
          </Text>
          <View style={{
             flexDirection: 'column',
             justifyContent: 'space-between',
             alignContent: 'center',
             gap: 20,
          }}>
          <UploadImage
            width={width * 0.6}
            height={width * 0.6}
            control={control}
            name="badStandardImage"
            isUploading={isBadStandardImageUploading}
            pickImage={pickBadStandardImage}
            label="อัพโหลดรูปภาพตัวอย่างงานที่ไม่ได้มาตรฐาน"
          />
          {/* <Text style={{marginBottom: 10}}>ผลกระทบจากงานที่ไม่ได้มาตรฐาน</Text> */}
          <Controller
            control={control}
            name="badStandardEffect"
            render={({
              field: {onChange, value, onBlur},
              fieldState: {error},
            }) => (
              <View style={{marginBottom: 100}}>
                <TextInput
                  mode="outlined"
                  numberOfLines={5}
                  multiline={true}
                  // label={'ผลกระทบจากงานที่ไม่ได้มาตรฐาน'}
                  onBlur={onBlur}
                  error={!!error}
                  style={
                    Platform.OS === 'ios'
                      ? {height: 100, textAlignVertical: 'top'}
                      : {}
                  }
                  placeholder="อธิบายความเสี่ยงที่ลูกค้าอาจพบเจอจากงานที่ไม่ได้มาตรฐาน..."
                  value={value || ''}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateStandard;
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {
    marginVertical: 20,
    backgroundColor: '#ffffff',
    width: width,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
