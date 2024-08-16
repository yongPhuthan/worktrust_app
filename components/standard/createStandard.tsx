import {BACK_END_SERVER_URL} from '@env';
import {yupResolver} from '@hookform/resolvers/yup';
import {useQueryClient} from '@tanstack/react-query';
import React, {useContext} from 'react';
import {Store} from '../../redux/store';

import {Controller, useForm, useWatch} from 'react-hook-form';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import {useUploadToCloudflare} from '../../hooks/useUploadtoCloudflare';
import {useCreateToServer} from '../../hooks/useUploadToserver';
import {usePickImage} from '../../hooks/utils/image/usePickImage';
import {Types} from 'mongoose';
import {nanoid} from 'nanoid';
import UploadImage from '../../components/ui/UploadImage';
import {
  StandardSchemaType,
  standardSchema,
} from '../../models/validationSchema/standard';
import useCreateStandard from '../../hooks/standard/create';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const CreateStandard = (props: Props) => {
  const {isVisible, onClose} = props;
  const [localPathUrl, setLocalPathUrl] = React.useState<string | null>(null);
  const {
    state: {code, companyId},
    dispatch,
  } = useContext(Store);
  const {width, height} = Dimensions.get('window');
  const [isError, setError] = React.useState('');
  const queryClient = useQueryClient();

  const defaultStandard: StandardSchemaType = {
    id: nanoid(),
    standardShowTitle: null,
    image: {
      originalUrl: '',
      thumbnailUrl: '',
      localPathUrl: '',
    },
    content: '',
    categories: null,
    companyId : new Types.ObjectId(companyId).toHexString(),
    badStandardImage:  {
      originalUrl: '',
      thumbnailUrl: '',
      localPathUrl: '',
    
    },
    badStandardEffect: null,
    created: new Date(),
    updated: new Date(),
  };
  const {
    register,
    control,
    setValue,
    getValues,
    formState: {errors, isValid},
  } = useForm<StandardSchemaType>({
    mode: 'onChange',
    defaultValues: defaultStandard,
    resolver: yupResolver(standardSchema),
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
    console.log("Picked image URI:", uri);
    setValue('image.localPathUrl', uri, { shouldValidate: true });
    console.log("Updated value in form:", getValues('image'));
  });

  const {
    isImagePicking: isBadStandardImageUploading,
    pickImage: pickBadStandardImage,
  } = usePickImage((uri: string) => {
    setValue('badStandardImage.localPathUrl', uri, { shouldValidate: true }); ;
  });
  const {
    isUploading: isStandardUploading,
    error: isStandardImageError,
    uploadImage: uploadStandardImage,
  } = useUploadToCloudflare(code, 'logo');

  const {
    isUploading: isBadStandardUploading,
    error: isBadStandardImageError,
    uploadImage: uploadBadStandardImage,
  } = useUploadToCloudflare(code, 'logo');

  const {mutate, isPending} = useCreateStandard();

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
      uploadStandardImage(image.thumbnailUrl),
      uploadBadStandardImage(badStandardImage.thumbnailUrl),
    ];

    const uploadedImages = await Promise.all(uploadPromises);
    try {
      // หน่วงเวลา 1.5 วินาทีก่อนเรียก setValue
      setTimeout(() => {
        if (
          !uploadedImages ||
          !uploadedImages[0].originalUrl ||
          !uploadedImages[0].thumbnailUrl ||
          !uploadedImages[1].originalUrl ||
          !uploadedImages[1].thumbnailUrl
        ) {
          Alert.alert('อัพโหลดล้มเหลว', 'กรุณาลองใหม่อีกครั้ง');
          return;
        }
        setValue('image.originalUrl', uploadedImages[0].originalUrl);
        setValue('image.thumbnailUrl', uploadedImages[0].thumbnailUrl);

        setValue('badStandardImage.originalUrl', uploadedImages[1].originalUrl);
        setValue(
          'badStandardImage.thumbnailUrl',
          uploadedImages[1].thumbnailUrl,
        );

        // ดึงค่าทั้งหมดจากฟอร์ม
        const formData = getValues();

        // ส่ง data ไปยังฟังก์ชัน mutate
        mutate(formData);
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
          loading={isBadStandardUploading || isStandardUploading}
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
            <View
              style={{
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
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />
              {/* <UploadImage
                width={width * 0.6}
                height={width * 0.6}
                control={control}
                name="image.localPathUrl"
                isUploading={isStandardImageUploading}
                pickImage={pickStandardImage}
                label="อัพโหลดภาพมาตรฐานของคุณ"
              /> */}
<Controller
  control={control}
  name={'image'}
  render={({ field: { onChange, value } }) => (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={() => pickStandardImage()}
    >
      {isStandardImageUploading ? (
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
          }}
        >
          <ActivityIndicator size="small" />
        </View>
      ) : value?.localPathUrl ? (
        <Image
          source={{
            uri: value.localPathUrl || value.thumbnailUrl,
          }}
          style={{
            height: height * 0.3,
            width: width * 0.6,
            aspectRatio: 1,
          }}
          onError={e =>
            console.log('Failed to load image:', e.nativeEvent.error)
          }
        />
      ) : value?.thumbnailUrl ? (
        <Image
          source={{
            uri: value.thumbnailUrl,
          }}
          style={{
            height: height * 0.3,
            width: width * 0.6,
            aspectRatio: 1,
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
              borderColor: '#047e6e',
              borderWidth: 1,
              backgroundColor: '#f5f5f5',
              borderRadius: 5,
              borderStyle: 'dashed',
              padding: 10,
              height: height * 0.3,
              width: width * 0.6,
            }}
            onPress={() => pickStandardImage()}
          >
            <IconButton
              icon="image-plus"
              iconColor={'#047e6e'}
              size={40}
              onPress={() => pickStandardImage()}
            />
            <Text
              style={{
                textAlign: 'center',
                color: '#047e6e',
              }}
            >
              อัพโหลดภาพมาตรฐานของคุณ
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )}
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
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
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
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignContent: 'center',
                gap: 20,
              }}>
              {/* <UploadImage
                width={width * 0.6}
                height={width * 0.6}
                control={control}
                name="badStandardImage.localPathUrl"
                isUploading={isBadStandardImageUploading}
                pickImage={pickBadStandardImage}
                label="อัพโหลดรูปภาพตัวอย่างงานที่ไม่ได้มาตรฐาน"
              /> */}
<Controller
  control={control}
  name={'badStandardImage'}
  render={({ field: { onChange, value } }) => (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={() => pickBadStandardImage()}
    >
      {isBadStandardImageUploading ? (
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
          }}
        >
          <ActivityIndicator size="small" />
        </View>
      ) : value?.localPathUrl ? (
        <Image
          source={{
            uri: value.localPathUrl || value.thumbnailUrl,
          }}
          style={{
            height: height * 0.3,
            width: width * 0.6,
            aspectRatio: 1,
          }}
          onError={e =>
            console.log('Failed to load image:', e.nativeEvent.error)
          }
        />
      ) : value?.thumbnailUrl ? (
        <Image
          source={{
            uri: value.thumbnailUrl,
          }}
          style={{
            height: height * 0.3,
            width: width * 0.6,
            aspectRatio: 1,
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
              borderColor: '#047e6e',
              borderWidth: 1,
              backgroundColor: '#f5f5f5',
              borderRadius: 5,
              borderStyle: 'dashed',
              padding: 10,
              height: height * 0.3,
              width: width * 0.6,
            }}
            onPress={() => pickBadStandardImage()}
          >
            <IconButton
              icon="image-plus"
              iconColor={'#047e6e'}
              size={40}
              onPress={() => pickBadStandardImage()}
            />
            <Text
              style={{
                textAlign: 'center',
                color: '#047e6e',
              }}
            >
              อัพโหลดรูปภาพตัวอย่างงานที่ไม่ได้มาตรฐาน
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )}
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
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
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
