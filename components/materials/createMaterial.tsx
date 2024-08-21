import {BACK_END_SERVER_URL} from '@env';
import {yupResolver} from '@hookform/resolvers/yup';
import React, {useContext} from 'react';
import {Store} from '../../redux/store';

import {Types} from 'mongoose';
import {nanoid} from 'nanoid';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import UploadImage from '../../components/ui/UploadImage';
import useCreateMaterial from '../../hooks/materials/create';
import {useUploadToCloudflare} from '../../hooks/useUploadtoCloudflare';
import {usePickImage} from '../../hooks/utils/image/usePickImage';
import {
  MaterialSchemaType,
  materialSchema,
} from '../../models/validationSchema/material';
import {ValidationError} from 'yup';

import {IMaterials} from 'models/DefaultMaterials';
import {IMaterialEmbed} from 'types/interfaces/ServicesEmbed';

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

  const defaultMaterial: MaterialSchemaType = {
    name: '',
    image: {
      id:nanoid(),
      thumbnailUrl: 'INIT',
      localPathUrl: '',
      originalUrl: 'INIT',
      created: new Date(),
    },
    description: '',
    companyId: new Types.ObjectId(companyId).toHexString(),
    created: new Date(),
    updated: new Date(),
  };
  const {
    register,
    control,
    setValue,
    getValues,
    formState: {errors, isValid, validatingFields},
  } = useForm<MaterialSchemaType>({
    mode: 'onChange',
    defaultValues: defaultMaterial,
    resolver: yupResolver(materialSchema),
  });

  const image = useWatch({
    control,
    name: 'image',
  });
  const {isImagePicking: isImageUploading, pickImage} = usePickImage(uri => {
    setValue('image.localPathUrl', uri);
  });

  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadToCloudflare(code, 'logo');

  const url = `${BACK_END_SERVER_URL}/api/company/createMaterial`;
  const {mutate, isPending} = useCreateMaterial();

  const handleSubmit = async () => {
    if (!isValid) {

      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน' );
      return;
    }
    if (!image.localPathUrl) {
      Alert.alert('Error', 'กรุณาเลือกรูปภาพ');
      return;
    }
    const uploadPromises = [await uploadImage(image.localPathUrl)];
    const downloadUrl = await Promise.all(uploadPromises);

    if (uploadError) {
      throw new Error('There was an error uploading the images');
    }
    if (!downloadUrl) {
      throw new Error('ไม่สามาถอัพโหลดรูปภาพได้');
    }

    try {
      if (
        downloadUrl &&
        downloadUrl[0].originalUrl &&
        downloadUrl[0].thumbnailUrl
      ) {
        setValue('image', {
          thumbnailUrl: downloadUrl[0].thumbnailUrl,
          originalUrl: downloadUrl[0].originalUrl,
        }, {shouldValidate:true});
      } else {
        Alert.alert('Error', 'ไม่สามารถอัพโหลดรูปภาพได้');
      }
      setValue('companyId', new Types.ObjectId(companyId).toHexString(), {
        shouldValidate: true,
      });
      setValue('created', new Date(), {shouldValidate: true});
      setValue('updated', new Date(), {shouldValidate: true});
      setValue('id', nanoid(), {shouldValidate: true});

      const formData = getValues();
      console.log('FormData',formData)
      mutate(formData);
    } catch (err) {
      // Handle errors from uploading images or creating the standard
      console.error('An error occurred:', err);
    } finally {
      onClose();
    }
  };
console.log('Is feild valid ', validatingFields)
console.log('isvalid', isValid)
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
            <Controller
              control={control}
              name={'image'}
              render={({field: {onChange, value}}) => (
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => pickImage()}>
                  {isUploading ? (
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',

                        borderColor: '#047e6e',
                        borderWidth: 1,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 5,
                        borderStyle: 'dashed',
                        padding: 10,
                        height: height * 0.3,
            width: width * 0.6,
                      }}>
                      <ActivityIndicator size="small" color="#047e6e" />
                    </View>
                  ) : value?.localPathUrl ? (
                    <Image
                      source={{uri: value.localPathUrl}}
                      style={{
                        height: height * 0.3,
                        width: width * 0.6,
                        aspectRatio: 1,
                      }}
                      onError={e =>
                        console.log(
                          'Failed to load image:',
                          e.nativeEvent.error,
                        )
                      }
                    />
                  ) : (
                    <View>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderColor: '#047e6e',
                          borderWidth: 1,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 5,
                          borderStyle: 'dashed',
                          padding: 10,
                          height: height * 0.3,
                          width: width * 0.6,
                        }}
                        onPress={() => pickImage()}>
                        <IconButton
                          icon="image-plus"
                          iconColor={'#047e6e'}
                          size={40}
                          onPress={() => pickImage()}
                        />
                        <Text
                          style={{
                            textAlign: 'center',
                            color: '#047e6e',
                          }}>
                          เลือกวัสดุอุปกรณ์ของคุณ
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
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
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
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
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
          </View>
          <Button
            loading={isUploading}
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
