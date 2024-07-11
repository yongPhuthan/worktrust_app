import {yupResolver} from '@hookform/resolvers/yup';
import React, {useContext, useState, useEffect} from 'react';
import {useQueryClient, QueryClient} from '@tanstack/react-query';
import {BACK_END_SERVER_URL} from '@env';
import {Store} from '../../redux/store';
import {v4 as uuidv4} from 'uuid';

import {Controller, useForm, useWatch} from 'react-hook-form';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import {usePickImage} from '../../hooks/utils/image/usePickImage';
import {useUploadToFirebase} from '../../hooks/useUploadtoFirebase';
import {useCreateToServer} from '../../hooks/useUploadToserver';
import {
  defaulatStandardSchema,
  standardEmbedSchema,
} from '../../models/validationSchema';
import {DefaultStandards, StandardEmbed} from '@prisma/client';
import UploadImage from '../../components/ui/UploadImage';
type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const CreateStandard = (props: Props) => {
  const {isVisible, onClose} = props;
  const {
    state: {code, companyId},
    dispatch,
  } = useContext(Store);
  const {width, height} = Dimensions.get('window');
  const [isError, setError] = React.useState('');
  const queryClient = useQueryClient();
  const defaultStandard: DefaultStandards = {
    id: uuidv4(),
    standardShowTitle: null,
    image: '',
    content: '',
    companyId,
    badStandardImage: null,
    badStandardEffect: null,
    createdAt: new Date(),
  };
  const {
    register,
    control,
    setValue,
    getValues,
    formState: {errors, isValid},
  } = useForm<DefaultStandards>({
    mode: 'onChange',
    defaultValues: defaultStandard,
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
    setValue('image', uri);
  });

  const {
    isImagePicking: isBadStandardImageUploading,
    pickImage: pickBadStandardImage,
  } = usePickImage((uri: string) => {
    setValue('badStandardImage', uri);
  });

  const standardStoragePath = `${code}/standards/${getValues(
    'standardShowTitle',
  )}`;
  const {
    isUploading: isStandardUploading,
    error: isStandardImageError,
    uploadImage: uploadStandardImage,
  } = useUploadToFirebase(standardStoragePath);
  const badStandardStoragePath = `${code}/badStandard/${getValues(
    'standardShowTitle',
  )}/badStandard`;
  const {
    isUploading: isBadStandardUploading,
    error: isBadStandardImageError,
    uploadImage: uploadBadStandardImage,
  } = useUploadToFirebase(badStandardStoragePath);

  const url = `${BACK_END_SERVER_URL}/api/services/createStandards`;
  const {isLoading, error, createToServer} = useCreateToServer(
    url,
    'standards',
  );
  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('กรุณาเพิ่มรูปภาพมาตรฐาน', '');
      return;
    }
    if (!badStandardImage) {
      Alert.alert('กรุณาเพิ่มรูปตัวอย่างงานที่ไม่ได้มาตรฐาน', '');
      return;
    }
    const uploadPromises = [
      uploadStandardImage(image),
      uploadBadStandardImage(badStandardImage),
    ];

    const uploadedImages = await Promise.all(uploadPromises);
    try {
      // หน่วงเวลา 1.5 วินาทีก่อนเรียก setValue
      setTimeout(() => {
        if (
          !uploadedImages ||
          !uploadedImages[0].originalUrl ||
          !uploadedImages[1].originalUrl
        ) {
          Alert.alert('อัพโหลดล้มเหลว', 'กรุณาลองใหม่อีกครั้ง');
          return;
        }
        setValue('image', uploadedImages[0].originalUrl);
        setValue('badStandardImage', uploadedImages[1].originalUrl);

        // Step 3: Proceed with creating the standard
        const formData = {
          ...getValues(),
        };

        createToServer(formData); // Assuming this method exists and is implemented to create the standard
      }, 1500);
    } catch (err) {
      // Handle errors from uploading images or creating the standard
      console.error('An error occurred:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      onClose();
    }
  };

  return (
    <>
          <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={onClose} />

        <Appbar.Content
          title={`เพิ่มมาตรฐาน`}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <Button
          loading={isBadStandardUploading || isStandardUploading || isLoading}
          disabled={!isValid}
          testID="submited-button"
          mode="contained"
          onPress={() => {
            handleSubmit();
          }}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <SafeAreaView style={styles.container}>

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
    </>

  );
};

export default CreateStandard;
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {
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
