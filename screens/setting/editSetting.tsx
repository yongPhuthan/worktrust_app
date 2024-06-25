import {BACK_END_SERVER_URL} from '@env';
import {yupResolver} from '@hookform/resolvers/yup';
import auth from '@react-native-firebase/auth';
import React, {useContext, useState} from 'react';
import {Controller, set, useForm, useWatch} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Appbar, TextInput} from 'react-native-paper';

import {useMutation, useQueryClient} from '@tanstack/react-query';

import {faCloudUpload, faRemove} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import storage from '@react-native-firebase/storage';

import type {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {Button} from 'react-native-paper';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import {ParamListBase} from '../../types/navigationType';
import {useUploadToFirebase} from '../../hooks/useUploadtoFirebase';
import {usePickImage} from '../../hooks/utils/image/usePickImage';
import {useCreateToServer} from '../../hooks/useUploadToserver';
import {usePutServer} from '../../hooks/putServer';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import {CompanyState} from 'types';

interface MyError {
  response: object;
  // add other properties if necessary
}
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditSetting'>;
  route: RouteProp<ParamListBase, 'EditSetting'>;
}

const EditSetting = ({navigation, route}: Props) => {
  const {company, seller}: any = route.params || {};
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const errorText = 'กรุณากรอกข้อมูล';
  const API_URL = `${BACK_END_SERVER_URL}/api/company/updateCompanySeller?id=${encodeURIComponent(
    company.id,
  )}`;

  //   const [company, setCompany] = useState(dataProps.company);
  const {
    state: {code},
    dispatch,
  } = useContext(Store);
  const defaultValues = {
    bizName: company.bizName,
    name: seller.name,
    logo: company.logo,
    lastName: seller.lastName,
    officeTel: company.officeTel,
    address: company.address,
    mobileTel: company.mobileTel,
    companyTax: company.companyTax,
    jobPosition: seller.jobPosition,
    id: company.id,
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: {errors, isDirty, dirtyFields, isValid},
  } = useForm<any>({
    mode: 'onChange',
    defaultValues,
  });
  const watchedValues: any = useWatch({
    defaultValue: defaultValues,
    control,
  });

  const logo = useWatch({
    control,
    name: 'logo',
  });
  const bizName = useWatch({
    control,
    name: 'bizName',
  });
  const dirtyValues = Object.keys(dirtyFields).reduce((acc, key) => {
    if (key in watchedValues) {
      acc[key] = watchedValues[key as keyof CompanyState];
    }
    return acc;
  }, {} as any);

  const {isImagePicking, pickImage} = usePickImage((uri: string) => {
    setValue('logo', uri, {shouldDirty: true});
  });
  const [visible, setVisible] = useState(false);

  const logoPath = `${code}/logo/${bizName}}`;
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadToFirebase(logoPath);
  const {isLoading, error, putToServer} = usePutServer(
    API_URL,
    'companySetting',
  );
  const updateCompany = async () => {
    if (dirtyFields.logo) {
      const downloadUrl = await uploadImage(logo as string);
      if (uploadError) {
        throw new Error('There was an error uploading the images');
      }
      if (!downloadUrl) {
        throw new Error('ไม่สามาถอัพโหลดรูปภาพได้');
      }
      setValue('logo', downloadUrl.originalUrl, {shouldDirty: true});
    }

    try {
      const formData = {
        ...getValues(),
      };
      await putToServer(formData);
    } catch (err) {
      console.error('Error in updateContractAndQuotation:', err);
      throw new Error(err as any);
    }
  };

  const {mutate, isPending} = useMutation({
    mutationFn: updateCompany,
    onSuccess: data => {
      Alert.alert(
        'บันทึกข้อมูลสำเร็จ',
        ``,
        [
          {
            text: 'ปิดหน้าต่าง',
            onPress: () => navigation.goBack(),
          },
        ],
        {cancelable: false},
      );
    },
    onError: (error: MyError) => {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        `Server-side user creation failed: ${error}`,
        [{text: 'OK'}],
        {cancelable: false},
      );
    },
  });

  const renderPage = () => {
    return (
      <>
        <View>
          <Controller
            control={control}
            name="logo"
            render={({field: {onChange, value}}) => (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  marginBottom: 10,

                  borderColor: 'gray',
                  borderWidth: 1,
                  borderRadius: 5,
                  borderStyle: 'dotted',
                  padding: 10,
                }}
                onPress={pickImage}>
                {isImagePicking ? (
                  <ActivityIndicator size="small" color="gray" />
                ) : value && value !== 'NONE' ? (
                  <Image
                    source={{
                      uri: value,
                    }}
                    style={{width: 100, aspectRatio: 2, resizeMode: 'contain'}}
                  />
                ) : (
                  <View>
                    <FontAwesomeIcon
                      icon={faCloudUpload}
                      style={{marginVertical: 5, marginHorizontal: 50}}
                      size={32}
                      color="gray"
                    />
                    <Text style={{textAlign: 'center', color: 'gray'}}>
                      อัพโหลดโลโก้
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
          <Controller
            control={control}
            name="bizName"
            rules={{required: true}}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <TextInput
                label="ชื่อบริษัท"
                error={!!error}
                style={styles.input}
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{flex: 0.45, marginVertical: 5}}>
              <Controller
                control={control}
                name="name"
                rules={{required: true}}
                render={({
                  field: {onChange, onBlur, value},
                  fieldState: {error},
                }) => (
                  <TextInput
                    label="ชื่อจริง"
                    error={!!error}
                    placeholder="ชื่อจริง"
                    multiline
                    textAlignVertical="top"
                    numberOfLines={1}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={{flex: 0.45, marginVertical: 5}}>
              <Controller
                control={control}
                name="lastName"
                rules={{required: true}}
                render={({
                  field: {onChange, onBlur, value},
                  fieldState: {error},
                }) => (
                  <TextInput
                    label="นามสกุล"
                    // placeholder="นามสกุล"
                    multiline
                    error={!!error}
                    textAlignVertical="top"
                    numberOfLines={1}
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>
          <Controller
            control={control}
            name="jobPosition"
            rules={{required: true}}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <TextInput
                label="ตำแหน่ง"
                error={!!error}
                style={styles.input}
                // placeholder="คำแหน่งในบริษัท"
                multiline
                textAlignVertical="top"
                numberOfLines={1}
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {/* {company.bizType === 'business' && (
         <Controller
           control={control}
           name="userPosition"
           rules={{required: true}}
           render={({field: {onChange, onBlur, value}}) => (
             <TextInput
             label="คำแหน่งในบริษัท"
style={styles.input}
               // placeholder="คำแหน่งในบริษัท"
               multiline
               textAlignVertical="top"
               numberOfLines={1}
               mode='outlined'
               onBlur={onBlur}
               onChangeText={onChange}
               value={value}
             />
           )}
         />
       )} */}
          <Controller
            control={control}
            name="address"
            rules={{required: true}}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <TextInput
                label="ที่อยู่"
                error={!!error}
                style={styles.input}
                // placeholder="ที่อยู่"
                keyboardType="name-phone-pad"
                multiline
                textAlignVertical="top"
                numberOfLines={4}
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 5,
            }}>
            <View style={{flex: 0.45}}>
              <Controller
                control={control}
                name="officeTel"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    label="เบอร์โทรศัพท์"
                    // placeholder="เบอร์โทรศัพท์"
                    keyboardType="phone-pad"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={{flex: 0.45}}>
              <Controller
                control={control}
                name="mobileTel"
                render={({
                  field: {onChange, onBlur, value},
                  fieldState: {error},
                }) => (
                  <TextInput
                    label="เบอร์มือถือ"
                    error={!!error}
                    // placeholder="เบอร์โทรศัพท์"
                    keyboardType="phone-pad"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>
          <Controller
            control={control}
            name="companyTax"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                style={styles.input}
                label="เลขทะเบียนภาษี(ถ้ามี)"
                // placeholder="เลขทะเบียนภาษี(ถ้ามี)"
                keyboardType="number-pad"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <View style={{marginBottom: 50}}></View>
        </View>
      </>
    );
  };
  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="แก้ไขข้อมูลธุรกิจ"
          titleStyle={{
            fontSize: 18,
            // fontFamily: 'Sukhumvit Set Bold',
            // fontWeight: 'bold',
          }}
        />
        <Button
          disabled={!isDirty || isPending || isUploading || isLoading}
          mode="contained"
          loading={isPending || isUploading || isLoading}
          onPress={() => mutate()}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView style={styles.container}>{renderPage()}</ScrollView>
        <View
          style={{
            width: '90%',
            alignSelf: 'baseline',
            borderBottomWidth: 0.3,
            borderBottomColor: '#cccccc',
          }}></View>
        <TouchableOpacity
          style={{paddingVertical: 15, paddingHorizontal: 24}}
          onPress={showDialog}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontSize: 15, fontWeight: '400', color: 'red'}}>
              Delete Account
            </Text>
            <FontAwesomeIcon icon={faRemove} size={16} color="red" />
          </View>
        </TouchableOpacity>
        <ConfirmDeleteDialog
          visible={visible}
          hideDialog={hideDialog}
          company={company.bizName}
        />
      </SafeAreaView>

    </>
  );
};

export default EditSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  label: {
    color: '#444444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#0066C0',
    color: '#FFFFFF',
    borderRadius: 5,

    width: 100,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  enabledButton: {
    backgroundColor: '#0066C0',
    borderRadius: 5,
    marginTop: 10,
    width: '50%',
    alignSelf: 'center',

    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderRadius: 5,
    marginTop: 10,
    width: '70%',
    alignSelf: 'center',
    height: 40,
    padding: 10,
  },
  title: {
    textAlign: 'center',
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
  },
  containerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    padding: 20,
    bottom: 0,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
  },
  outlinedButtonText: {
    color: '#0073BA',
    textDecorationLine: 'underline',
  },
  previousButton: {
    borderColor: '#0073BA',
    backgroundColor: 'white',
    marginTop: 20,
  },
  submitedButton: {
    backgroundColor: '#0073BA',
    paddingVertical: 12.5,
    paddingHorizontal: 20,
    borderRadius: 5,
    height: 50,
    width: 200,
  },
});
