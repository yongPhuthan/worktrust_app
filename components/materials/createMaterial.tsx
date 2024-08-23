import { BACK_END_SERVER_URL } from '@env';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useContext } from 'react';
import { Store } from '../../redux/store';
import firebase from '../../firebase'
import { nanoid } from 'nanoid';
import * as stateAction from '../../redux/actions';
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
  TextInput,
} from 'react-native-paper';
import useCreateMaterial from '../../hooks/materials/create';
import { useUploadToCloudflare } from '../../hooks/useUploadtoCloudflare';
import { usePickImage } from '../../hooks/utils/image/usePickImage';
import { materialSchema, MaterialSchemaType } from '../../validation/collection/subcollection/materials';


type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const CreateMaterial = (props: Props) => {
  const {isVisible, onClose} = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const firestore = firebase.firestore();
  const {
    state: {code, companyId,G_materials},
    dispatch,
  } = useContext(Store);

  const defaultMaterial: MaterialSchemaType = {
    id: nanoid(),
    name: '',
    image: {
      id:nanoid(),
      thumbnailUrl: 'INIT',
      localPathUrl: '',
      originalUrl: 'INIT',
      createAt: new Date(),
    },
    description: '',
    createAt: new Date(),
    updateAt : new Date(),

  
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
    // resolver: yupResolver(materialSchema),
  });
const name = useWatch({
    control,
    name: 'name',
})
const description = useWatch({
    control,
    name: 'description',
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


  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    if (!image.localPathUrl) {
      Alert.alert('Error', 'กรุณาเลือกรูปภาพ');
      return;
    }
  
    setIsLoading(true); // ตั้งค่า loading status
  
    try {
      // อัปโหลดภาพ
      const uploadPromises = [await uploadImage(image.localPathUrl)];
      const downloadUrl = await Promise.all(uploadPromises);
  
      if (!downloadUrl || !downloadUrl[0].originalUrl || !downloadUrl[0].thumbnailUrl) {
        throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
      }
  
      const existingId = getValues('id'); // ดึง id ที่มีอยู่จากฟอร์ม
      const newId = existingId || nanoid(); // ใช้ id เดิมถ้ามีอยู่แล้ว, ถ้าไม่มีก็สร้างใหม่
  
      // ตั้งค่า value สำหรับรูปภาพในฟอร์ม
      setValue('image', {
        thumbnailUrl: downloadUrl[0].thumbnailUrl,
        originalUrl: downloadUrl[0].originalUrl,
        localPathUrl: image.localPathUrl,
        createAt: existingId ? getValues('createAt') : new Date(), // ใช้วันที่สร้างเดิมถ้ามีอยู่แล้ว
        id: newId, // ใช้ id ที่ถูกกำหนดไว้
      }, { shouldValidate: true });
  
      const formData: MaterialSchemaType = getValues(); // ดึงข้อมูลจากฟอร์มทั้งหมดหลังจากที่ได้ตั้งค่ารูปภาพแล้ว
  
      const materialRef = firestore
        .collection('companies')
        .doc(companyId)
        .collection('materials')
        .doc(newId);
  
 await materialRef.set({
          ...formData,
        });
  
      // ดึง materials ปัจจุบันจาก Redux store
      const currentMaterials = G_materials || [];
  
      // เพิ่ม material ใหม่เข้าไปในอาร์เรย์และเรียงลำดับตามวันที่สร้างหรืออัพเดตล่าสุด
      const updatedMaterials = [formData, ...currentMaterials].sort(
        (a, b) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()
      );
  
      // เรียกใช้ dispatch เพื่ออัปเดต Redux store
      dispatch(stateAction.get_material(updatedMaterials));
  
      Alert.alert('Success', 'ข้อมูลถูกอัพโหลดสำเร็จ');
    } catch (err) {
      console.error('An error occurred:', err);
      Alert.alert('Error', 'เกิดข้อผิดพลาดระหว่างการอัพโหลดข้อมูล');
    } finally {
      setIsLoading(false); // ปิด loading status
      onClose();
    }
  };

  const disbledButton = !image.localPathUrl || !name || !description || isUploading || isImageUploading;
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
        <Appbar.Action disabled={disbledButton} loading={
          isUploading 
        }   icon="check" onPress={() => handleSubmit()} />
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
                  {isImageUploading ? (
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
                    onBlur={onBlur} // แก้ไขตรงนี้
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
          {/* <Button
            loading={isUploading}
            disabled={!isValid}
            style={{width: '90%', alignSelf: 'center', marginBottom: 20}}
            mode="contained"
            onPress={() => {
              handleSubmit();
            }}>
            {'บันทึก'}
          </Button> */}
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
