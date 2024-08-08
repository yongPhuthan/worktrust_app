import { BACK_END_SERVER_URL } from '@env';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useContext } from 'react';
import { Store } from '../../redux/store';

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
  Text,
  TextInput
} from 'react-native-paper';
import UploadImage from '../../components/ui/UploadImage';
import { useCreateToServer } from '../../hooks/useUploadToserver';
import { useUploadToCloudflare } from '../../hooks/useUploadtoCloudflare';
import { usePickImage } from '../../hooks/utils/image/usePickImage';
import { materialSchema } from '../../models/validationSchema';
import { nanoid } from 'nanoid';
import { IMaterialEmbed } from 'types/interfaces/ServicesEmbed';
import { IDefaultMaterials } from '../../models/DefaultMaterials';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const CreateMaterial = (props: Props) => {
  const {isVisible, onClose} = props;
  const {
    state: {code, companyId},
    dispatch,
  } = useContext(Store);

  const defaultMaterial: IDefaultMaterials = {
    id: nanoid(),
    name: '',
    image: '',
    description: '',
    companyId,
    created: new Date(),
    updated: new Date(),
  };
  const {
    register,
    control,
    setValue,
    getValues,
    formState: {errors, isValid},
  } = useForm<IDefaultMaterials>({
    mode: 'onChange',
    defaultValues: defaultMaterial,
    resolver: yupResolver(materialSchema),
  });

  const image = useWatch({
    control,
    name: 'image',
  });
  const {
    isImagePicking: isStandardImageUploading,
    pickImage: pickStandardImage,
  } = usePickImage((uri: string) => {
    setValue('image', uri);
  });

  const materialStoragePath = `${code}/materials/${getValues('name')}`;
  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadToCloudflare(
    code, 'materials'
  );

  const url = `${BACK_END_SERVER_URL}/api/company/createMaterial`;
  const {isLoading, error, createToServer} = useCreateToServer(
    url,
    'defaultMaterials',
  );
  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const uploadPromises = [(await uploadImage(image)).originalUrl];
    const downloadUrl = await Promise.all(uploadPromises);

    if (uploadError) {
      throw new Error('There was an error uploading the images');
    }
    if (!downloadUrl) {
      throw new Error('ไม่สามาถอัพโหลดรูปภาพได้');
    }

    try {
      if (downloadUrl && downloadUrl[0]) {
        setValue('image', downloadUrl[0]);
      } else {
        Alert.alert('Error', 'ไม่สามารถอัพโหลดรูปภาพได้');
      }

      const formData = {
        ...getValues(),
      };
      await createToServer(formData);
    } catch (err) {
      // Handle errors from uploading images or creating the standard
      console.error('An error occurred:', err);
    } finally {
      if (error || uploadError) {
        Alert.alert('Error', error?.message);
      } else {
        onClose();
      }
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
        <Appbar.BackAction onPress={() => onClose()} />

        <Appbar.Content
          title={`เพิ่มวัสดุอุปกรณ์`}
          titleStyle={{
            fontSize: 18,
          }}
        />
      </Appbar.Header>
      <SafeAreaView style={styles.container}>

<ScrollView>
  <View
    style={{
      marginBottom: 30,
      paddingHorizontal: 20,
      paddingVertical: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignContent: 'center',
      gap: 20,
    }}>
      <UploadImage 
        control={control}
        name="image"
        label="อัพโหลดรูปวัสดุ-อุปกรณ์"
        isUploading={isStandardImageUploading}
        pickImage={pickStandardImage}
        width={200}
        height={200}
      />
    {/* <Controller
      control={control}
      name="image"
      render={({field: {onChange, value}}) => (
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => pickStandardImage()}>
          {value ? (
            <Image
              source={{uri: value}}
              style={{
                width: 200,
                aspectRatio: 1,
                resizeMode: 'contain',
              }}
              onError={e =>
                console.log('Failed to load image:', e.nativeEvent.error)
              }
            />
          ) : (
            <View>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 5,
                  borderColor: '#0073BA',
                  borderWidth: 1,
                  borderRadius: 5,
                  borderStyle: 'dashed',
                  marginVertical: 20,
                  padding: 10,
                  height: 150,
                  width: 200,
                }}
                onPress={() => {
                  pickStandardImage();
                }}>
                {isStandardImageUploading ? (
                  <ActivityIndicator size="small" color="gray" />
                ) : (
                  <IconButton
                    icon="image-plus"
                    iconColor={'#0073BA'}
                    size={40}
                    onPress={() => pickStandardImage()}
                  />
                )}
              </TouchableOpacity>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#0073BA',
                  fontFamily: 'Sukhumvit set',
                }}>
                อัพโหลดรูปภาพวัสดุ-อุปกรณ์
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    /> */}
    <Controller
      control={control}
      name="name"
      render={({
        field: {onChange, value, onBlur},
        fieldState: {error},
      }) => (
        <View>
          <TextInput
            mode="outlined"
            label={'ชื่อ'}
            onBlur={onBlur}
            error={!!error}
            placeholder="เช่น บานพับปีกผีเสื้อ..."
            value={value}
            onChangeText={onChange}
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />

    <Controller
      control={control}
      name="description"
      render={({
        field: {onChange, value, onBlur},
        fieldState: {error},
      }) => (
        <View>
          <TextInput
            mode="outlined"
            numberOfLines={4}
            label={'รายละเอียด'}
            multiline={true}
            onBlur={onBlur}
            error={!!error}
            style={
              Platform.OS === 'ios'
                ? {height: 100, textAlignVertical: 'top'}
                : {}
            }
            placeholder="จุดเด่นหรือรายละเอียดของวัสดุ-อุปกรณ์..."
            value={value}
            onChangeText={onChange}
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  </View>
  <Button
    loading={isLoading || isUploading}
    disabled={!isValid}
    style={{width: '90%', alignSelf: 'center', marginBottom: 20}}
    mode="contained"
    onPress={() => {
      handleSubmit();
    }}>
    {'บันทึก'}
  </Button>
</ScrollView>
</SafeAreaView>
    </>

  );
};

export default CreateMaterial;
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {

    backgroundColor: '#ffffff',
    width: width,
    height: height,
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
