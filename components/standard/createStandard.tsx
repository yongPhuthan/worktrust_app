import {yupResolver} from '@hookform/resolvers/yup';
import React from 'react';
import {useQueryClient, QueryClient} from '@tanstack/react-query';
import {BACK_END_SERVER_URL} from '@env';

import {Controller, useForm} from 'react-hook-form';
import {
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
import {createStandardSchema} from '../../screens/utils/validationSchema';
import {useUploadToFirebase} from '../../hooks/useUploadtoFirebase';
import {useCreateToServer} from '../../hooks/useUploadToserver';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  companyId: string;
};

const CreateStandard = (props: Props) => {
  const {isVisible, onClose, companyId} = props;
  const [isError, setError] = React.useState('');
  const queryClient = useQueryClient();
  const defaultStandard = {
    standardShowTitle: null,
    image: null,
    content: null,
    badStandardImage: null,
    badStandardEffect: null,
    sellerId: companyId,
  };
  const {
    register,
    control,
    setValue,
    getValues,
    formState: {errors, isValid},
  } = useForm<any>({
    mode: 'onChange',
    defaultValues: defaultStandard,
    resolver: yupResolver(createStandardSchema),
  });
  const {
    isImageUploading: isStandardImageUploading,
    pickImage: pickStandardImage,
  } = usePickImage((uri: string) => {
    setValue('image', uri);
  });

  const {
    isImageUploading: isBadStandardImageUploading,
    pickImage: pickBadStandardImage,
  } = usePickImage((uri: string) => {
    setValue('badStandardImage', uri);
  });

  const standardStoragePath = `${companyId}/standards/${getValues(
    'standardShowTitle',
  )}`;
  const {
    imageUrl: standardImageUrl,
    isUploading: isStandardUploading,
    error: isStandardImageError,
    uploadImage: uploadStandardImage,
  } = useUploadToFirebase(standardStoragePath);
  const badStandardStoragePath = `${companyId}/badStandard/${getValues(
    'standardShowTitle',
  )}/badStandard`;
  const {
    imageUrl: badStandardImageUrl,
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
    if (!isValid) {
      setError('Form is not valid');
      return;
    }
    setError('');

    // Step 1: Start uploading both images
    try {
      const uploadPromises = [
        uploadStandardImage(getValues('image')), // Assuming these methods don't need extra args
        uploadBadStandardImage(getValues('badStandardImage')),
      ];

      const uploadedImages = await Promise.all(uploadPromises);

      // Additional validation if URLs are required
      if (!uploadedImages) {
        setError('Failed to upload images');
        return;
      }

      // Step 3: Proceed with creating the standard
      const formData = {
        ...getValues(),
      };

      await createToServer(formData); // Assuming this method exists and is implemented to create the standard
    } catch (err) {
      // Handle errors from uploading images or creating the standard
      console.error('An error occurred:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      onClose();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.BackAction onPress={() => onClose()} />

        <Appbar.Content
          title={`เพิ่มมาตรฐาน`}
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit set',
          }}
        />
        <Button
          loading={isBadStandardUploading || isStandardUploading || isLoading}
          disabled={!isValid}
          testID="submited-button"
          mode="contained"
          buttonColor={'#1b72e8'}
          onPress={() => {
            handleSubmit();
          }}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <ScrollView>
        <View
          style={{
            marginBottom: 30,
            paddingHorizontal: 20,
            paddingVertical: 20,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignContent: 'center',
          }}>
          <Text
            variant="titleLarge"
            style={{
              marginBottom: 10,
              fontFamily: 'Sukhumvit set',
              fontWeight: 'bold',
            }}>
            มาตรฐานของคุณ
          </Text>

          <Text style={{marginBottom: 10}}>ชื่อมาตรฐาน</Text>
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
                  placeholder="เช่น การป้องกันน้ำรั่วซึม..."
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
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
                      เพิ่มภาพตัวอย่างมาตรฐานของคุณ
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
          <Text style={{marginBottom: 10}}>รายละเอียด</Text>
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
                      ? {height: 80, textAlignVertical: 'top'}
                      : {}
                  }
                  placeholder="อธิบายจุดเด่นเกี่ยวกับมาตรฐานของคุณ..."
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
        </View>
        <Divider />
        <View
          style={{
            backgroundColor: '#dddddd',
            paddingHorizontal: 20,
            paddingVertical: 30,
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
            }}>
            ตัวอย่างงานที่ไม่ได้มาตรฐาน
          </Text>

          <Controller
            control={control}
            name="badStandardImage"
            render={({field: {onChange, value}}) => (
              <TouchableOpacity
                style={{
                  alignItems: 'center',

                  justifyContent: 'center',
                }}
                onPress={() => pickBadStandardImage()}>
                {isBadStandardImageUploading ? (
                  <ActivityIndicator size="small" color="gray" />
                ) : value ? (
                  <Image
                    source={{uri: value}}
                    style={{
                      width: 200,
                      aspectRatio: 1,
                      resizeMode: 'contain',
                      marginBottom: 20,
                    }}
                    onError={e =>
                      console.log('Failed to load image:', e.nativeEvent.error)
                    }
                  />
                ) : (
                  <View
                    style={{
                      marginBottom: 20,
                    }}>
                    <TouchableOpacity
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 5,
                        borderColor: '#0073BA',
                        borderWidth: 1,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 5,
                        borderStyle: 'dashed',
                        // marginHorizontal: 100,
                        padding: 10,
                        height: 150,
                        width: 200,
                      }}
                      onPress={() => pickBadStandardImage()}>
                      <IconButton
                        icon="image-plus"
                        iconColor={'#0073BA'}
                        size={40}
                        onPress={() => pickBadStandardImage()}
                      />
                    </TouchableOpacity>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#0073BA',
                        fontFamily: 'Sukhumvit set',
                      }}>
                      เพิ่มภาพตัวอย่างงานที่ไม่ได้มาตรฐาน
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
          <Text style={{marginBottom: 10}}>ผลกระทบจากงานที่ไม่ได้มาตรฐาน</Text>
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
                  onBlur={onBlur}
                  error={!!error}
                  style={
                    Platform.OS === 'ios'
                      ? {height: 80, textAlignVertical: 'top'}
                      : {}
                  }
                  placeholder="อธิบายความเสี่ยงที่ลูกค้าอาจพบเจอจากงานที่ไม่ได้มาตรฐาน..."
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
