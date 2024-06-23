import { BACK_END_SERVER_URL } from '@env';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useContext } from 'react';
import { Store } from '../../redux/store';

import { DefaultMaterials } from '@prisma/client';
import { usePutServer } from '../../hooks/materials/useUpdate';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
    IconButton,
    Text,
    TextInput
} from 'react-native-paper';
import { useUploadToFirebase } from '../../hooks/useUploadtoFirebase';
import { usePickImage } from '../../hooks/utils/image/usePickImage';
import { useUser } from '../../providers/UserContext';
import { materialSchema } from '../../models/validationSchema';

type Props = {
  onClose: () => void;
  material: DefaultMaterials ;
  setRefetch: () => void;

};

const UpdateMaterial = (props: Props) => {
  const {onClose,material,setRefetch} = props;
  const user = useUser();
  const queryClient = useQueryClient();

  const {
    state: {code},
    dispatch,
  } = useContext(Store);

  const {
    register,
    control,
    setValue,
    getValues,
    formState: {errors, isValid,isDirty},
  } = useForm<DefaultMaterials>({
    mode: 'onChange',
    defaultValues: material,
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
  } = useUploadToFirebase(materialStoragePath);

  const url = `${BACK_END_SERVER_URL}/api/company/updateMaterial`;


  const {isLoading, error, putToServer} = usePutServer(
    url,
    'defaultMaterials',
  );
  const updateMaterial = useCallback(async () => {
    if (!user || !user.uid ) {
      console.error('User  error');
      return;
    }

    try {
      if (isDirty) {
        if ( image && image !== material.image) {
          const downloadUrl = await uploadImage(image);
          if (!downloadUrl) {
            throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
          }
          setValue('image', downloadUrl.originalUrl as string, {
            shouldDirty: true,
          });
        }
        const formData = getValues();
        console.log('formData', formData);
        await putToServer(formData);
        setRefetch();
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
    material.image,
    isDirty,
    setValue,
    getValues,
    uploadImage,
    putToServer,
    setRefetch,
    onClose,
  ]);
  const {mutate, isPending} = useMutation({
    mutationFn: updateMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['materials'],
      });
      setRefetch();
      onClose();
    },
    onError: error => {
      console.log('onError', error);
    },
  });


  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={() => onClose()} />

        <Appbar.Content
          title={`แก้ไขวัสดุอุปกรณ์`}
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
          }}
        />
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
            gap: 20,
          }}>
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
                      อัพโหลดรูปภาพวัสดุ-อุปกรณ์
                    </Text>
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
                  numberOfLines={2}
                  label={'รายละเอียด'}
                  multiline={true}
                  onBlur={onBlur}
                  error={!!error}
                  style={
                    Platform.OS === 'ios'
                      ? {height: 60, textAlignVertical: 'top'}
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
          loading={isLoading || isUploading || isPending}
          disabled={!isDirty || isPending}
          style={{width: '90%', alignSelf: 'center', marginBottom: 20}}
          mode="contained"
          onPress={() => {
            mutate();
          }}>
          {'บันทึก'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateMaterial;
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
