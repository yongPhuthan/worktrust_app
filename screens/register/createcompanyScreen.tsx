import { faCloudUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import {BACK_END_SERVER_URL} from '@env';
import {useMutation} from '@tanstack/react-query';

import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Checkbox,
  ProgressBar,
  TextInput,
} from 'react-native-paper';
import { ValidationError } from 'yup';
import { useCreateCompany } from '../../hooks/firestore/register/useCreateCompanySeller';
import { useUploadToCloudflare } from '../../hooks/useUploadtoCloudflare';
import { usePickImage } from '../../hooks/utils/image/usePickImage';

import { useUser } from '../../providers/UserContext';
import { ParamListBase } from '../../types/navigationType';
import { CompanyCreateSchema, CompanyCreateSchemaType, CreateCompanyValidationSchema, CreateCompanyValidationSchemaType, PostCreateCompanyValidationSchema, UserCreateCompanySchema, UserCreateCompanySchemaType } from '../../models/validationSchema/register/createCompanyScreen';
import { useCreateToServer } from '../../hooks/useUploadToserver';
import { IUser } from '../../models/User';
import { ICompany } from '../../models/Company';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'RegisterScreen'>;
}
const screenWidth = Dimensions.get('window').width;
const checkboxStyle = {
  borderRadius: 5, // Rounded corners
  borderWidth: 1, // Border width
  borderColor: 'grey', // Border color
  backgroundColor: 'white', // Background color
};

const CreateCompanyScreen = ({navigation}: Props) => {
  const [page, setPage] = useState<number>(1);
  const [userLoading, setUserLoading] = useState(false);
  const API_URL = `${BACK_END_SERVER_URL}/api/company/createCompanySeller`;

  const user = useUser();
  if (!user) {
    return;
  }
  const initialSeller: UserCreateCompanySchemaType = {
    name: '',
    jobPosition: '',
  };
  const initialCompany: CompanyCreateSchemaType = {
    code: nanoid(6),
    bizName: '',
    address: '',
    officeTel: '',
    mobileTel: '',
    companyTax: '',
    userUids: [user.uid],
    bizType: '',
    logo: '',
  };

  const {
    handleSubmit,
    setValue,
    control,
    getValues,
    formState: {isValid, isDirty, errors},
  } = useForm<CreateCompanyValidationSchemaType>({
    mode: 'onChange',
    defaultValues: {
      seller: initialSeller,
      company: initialCompany,
    },
    resolver: yupResolver(CreateCompanyValidationSchema),
  });
  const logo = useWatch({
    control,
    name: 'company.logo',
  });
  const seller = useWatch({
    control,
    name: 'seller',
  });
  const company = useWatch({
    control,
    name: 'company',
  });
  const code = useWatch({
    control,
    name: 'company.code',
  });
  const bizName = useWatch({
    control,
    name: 'company.bizName',
  });
  const name = useWatch({
    control,

    name: 'seller.name',
  });

  const bizType = useWatch({
    control,

    name: 'company.bizType',
  });
  const companyTax = useWatch({
    control,

    name: 'company.companyTax',
  });

  const jobPosition = useWatch({
    control,

    name: 'seller.jobPosition',
  });
  const address = useWatch({
    control,

    name: 'company.address',
  });
  const mobileTel = useWatch({
    control,

    name: 'company.mobileTel',
  });
  const officeTel = useWatch({
    control,
    name: 'company.officeTel',
  });

  const {isImagePicking: isImagePicking, pickImage} = usePickImage(
    (uri: string) => {
      setValue('company.logo', uri, {shouldDirty: true, shouldValidate: true});
    },
  );
  const {
    isUploading,
    error: isLogoError,
    uploadImage,
  } = useUploadToCloudflare(code, 'logo');

  const isNextDisabledPage1 = !bizName || !name || !jobPosition || !bizType;

  useEffect(() => {
    setValue(
      'company.code',
      Math.floor(100000 + Math.random() * 900000).toString(),
    );
  }, []);

  const handleNextPage = () => {
    setPage(page + 1);
  };
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const {isLoading, error, createCompany} = useCreateCompany();
  const {
    isLoading: isLodingServer,
    error: errorServer,
    createToServer,
  } = useCreateToServer(API_URL, 'dashboardQuotation');
  const createCompanySeller = async ({ seller, company, token }: { seller: UserCreateCompanySchemaType, company: CompanyCreateSchemaType, token: string }) => {
    if (!token) {
      throw new Error('Token is not available');
    }
  
    if (company.logo) {
      try {
        const downloadUrl = await uploadImage(company.logo as string);
        if (!downloadUrl || !downloadUrl.originalUrl) {
          throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
        }
        company.logo = downloadUrl.originalUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Error uploading image');
      }
    }
  
    try {
      const formData = { seller, company, token };
      const success = await createToServer(formData);
      if (!success) {
        throw new Error('Error creating company and user');
      }
    } catch (error) {
      console.error('Error creating company and user:', error);
      throw new Error('Error creating company and user');
    }
  };
  const { mutate, isPending, isError } = useMutation({
    mutationFn: createCompanySeller,
    onSuccess: () => {
      console.log('success');
      //clear navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'DashboardQuotation' }],
      });
    },
    onError: (error: any) => {
      console.error('Error response:', error);
      Alert.alert('Error', error.message || 'There was an error processing the request');
    },
  });

  const handleSave = async () => {
    try {
      const sellerValidated = await UserCreateCompanySchema.validate(seller) as UserCreateCompanySchemaType
      const companyValidated = await CompanyCreateSchema.validate(company) as CompanyCreateSchemaType
      const postValidated = await PostCreateCompanyValidationSchema.validate({
        seller: sellerValidated,
        company: companyValidated,
        token: user?.uid,
      });

      if (logo) {
        const uploadedLogo = await uploadImage(logo);
        if (!uploadedLogo) {
          throw new Error('Failed to upload image');
        }
        console.log('uploadedLogo', uploadedLogo);
        mutate({seller:sellerValidated, company:companyValidated, token: user.uid});

  
      } else {
        const success = await createCompany({
          seller: postValidated.seller,
          company: company,
        });
  
        if (success) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'DashboardQuotation' }],
          });
        }
      }


    } catch (error) {
      console.error('Error:', error);

      if (error instanceof ValidationError) {
        Alert.alert('ข้อผิดพลาด', error.message);
      } else {
        Alert.alert('Error', 'There was an error processing the request');
      }

      throw new Error('There was an error processing the request');
    }
  };
  const width = Dimensions.get('window').width;
  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <>
            <Appbar.Header
              elevated
              mode="center-aligned"
              style={{
                backgroundColor: 'white',
              }}>
              <Appbar.Content
                title="ตั้งค่าธุรกิจ"
                titleStyle={{fontSize: 18}}
              />
              <Button
                mode="contained"
                shouldRasterizeIOS
                disabled={isNextDisabledPage1}
                onPress={handleNextPage}>
                <Text>ไปต่อ</Text>
              </Button>
            </Appbar.Header>
            <ProgressBar progress={progress} />
            <ScrollView style={{marginTop: 10, paddingHorizontal: 20}}>
              <Controller
                control={control}
                name="company.logo"
                render={({field: {onChange, value}}) => (
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      marginVertical: 20,
                      borderColor: 'gray',
                      borderWidth: 1,
                      borderRadius: 10,
                      borderStyle: 'dotted',
                      marginHorizontal: 100,
                      padding: 10,
                    }}
                    onPress={pickImage}>
                    {isImagePicking ? (
                      <ActivityIndicator size="small" color="gray" />
                    ) : value ? (
                      <Image
                        source={{uri: (value as string) || ''}}
                        style={{
                          width: 100,
                          aspectRatio: 1,
                          resizeMode: 'contain',
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
                        <FontAwesomeIcon
                          icon={faCloudUpload}
                          size={32}
                          color="gray"
                          style={{marginVertical: 5, marginHorizontal: 50}}
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
                name="company.bizName"
                render={({
                  field: {onChange, value, onBlur},
                  fieldState: {error},
                }) => (
                  <View style={{marginBottom: 10}}>
                    <TextInput
                      mode="outlined"
                      onBlur={onBlur}
                      error={!!error}
                      label="ชื่อธุรกิจ - ชื่อบริษัท"
                      value={value}
                      onChangeText={onChange}
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <View>
                <Controller
                  control={control}
                  name="seller.name"
                  render={({
                    field: {onChange, value, onBlur},
                    fieldState: {error},
                  }) => (
                    <View style={{marginBottom: 10}}>
                      <TextInput
                        mode="outlined"
                        onBlur={onBlur}
                        error={!!error}
                        label="ชื่อจริง-นามสกุล"
                        value={String(value)}
                        onChangeText={onChange}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
              <Controller
                control={control}
                name="seller.jobPosition"
                render={({
                  field: {onChange, value, onBlur},
                  fieldState: {error},
                }) => (
                  <View style={{marginBottom: 20, width: width * 0.5}}>
                    <TextInput
                      mode="outlined"
                      onBlur={onBlur}
                      error={!!error}
                      label="ตำแหน่ง"
                      value={String(value)}
                      onChangeText={onChange}
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />
              <Text style={{marginBottom: 10, fontSize: 14}}>
                เลือกประเภทธุรกิจ
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  marginBottom: 10,
                  gap: 10,
                }}>
                <Controller
                  control={control}
                  name="company.bizType"
                  render={({field: {value}}) => (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Checkbox.Android
                        style={{...checkboxStyle, flexDirection: 'row-reverse'}}
                        uncheckedColor="grey"
                        status={
                          value === 'individual' ? 'checked' : 'unchecked'
                        }
                        onPress={() =>
                          setValue('company.bizType', 'individual', {
                            shouldValidate: true,
                          })
                        }
                      />
                      <Text>บุคคลธรรมดา</Text>
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="company.bizType"
                  render={({field: {value}}) => (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Checkbox.Android
                        // label="บริษัท-หจก"
                        style={{...checkboxStyle, flexDirection: 'row-reverse'}}
                        uncheckedColor="grey"
                        status={value === 'business' ? 'checked' : 'unchecked'}
                        onPress={() =>
                          setValue('company.bizType', 'business', {
                            shouldDirty: true,
                          })
                        }
                      />
                      <Text>บริษัท-หจก</Text>
                    </View>
                  )}
                />
              </View>
            </ScrollView>
          </>
        );
      case 2:
        return (
          <>
            <Appbar.Header
              elevated
              mode="center-aligned"
              style={{
                backgroundColor: 'white',
              }}>
              <Appbar.BackAction onPress={handlePrevPage} />
              <Appbar.Content
                title="ตั้งค่าธุรกิจ"
                titleStyle={{fontSize: 18}}
              />
              <Button
                onPress={handleSave}
                disabled={isUploading}
                mode="contained"
                loading={userLoading || isUploading || isLoading}>
                บันทึก
              </Button>
            </Appbar.Header>
            <ProgressBar progress={progress} />
            <View style={{marginTop: 30, paddingHorizontal: 10}}>
              <Controller
                control={control}
                name="company.address"
                render={({
                  field: {onChange, value, onBlur},
                  fieldState: {error},
                }) => (
                  <View style={{marginBottom: 20}}>
                    <TextInput
                      mode="outlined"
                      onBlur={onBlur}
                      error={!!error}
                      style={
                        Platform.OS === 'ios'
                          ? {height: 80, textAlignVertical: 'top'}
                          : {}
                      }
                      numberOfLines={3}
                      multiline={true}
                      textAlignVertical="top"
                      label="ที่อยู่ร้าน"
                      value={value}
                      onChangeText={onChange}
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{flex: 0.45}}>
                  <Controller
                    control={control}
                    name="company.officeTel"
                    render={({
                      field: {onChange, value, onBlur},
                      fieldState: {error},
                    }) => (
                      <View style={{marginBottom: 20}}>
                        <TextInput
                          mode="outlined"
                          onBlur={onBlur}
                          error={!!error}
                          label="เบอร์โทรบริษัท"
                          keyboardType="number-pad"
                          maxLength={10}
                          value={String(value)}
                          onChangeText={onChange}
                        />
                        {error && (
                          <Text style={styles.errorText}>{error.message}</Text>
                        )}
                      </View>
                    )}
                  />
                </View>
                <View style={{flex: 0.45}}>
                  <Controller
                    control={control}
                    name="company.mobileTel"
                    render={({
                      field: {onChange, value, onBlur},
                      fieldState: {error},
                    }) => (
                      <View style={{marginBottom: 20}}>
                        <TextInput
                          mode="outlined"
                          onBlur={onBlur}
                          error={!!error}
                          label="เบอร์มือถือ"
                          maxLength={10}
                          keyboardType="number-pad"
                          value={value ? value.toString() : ''}
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
              <Controller
                control={control}
                name="company.companyTax"
                render={({
                  field: {onChange, value, onBlur},
                  fieldState: {error},
                }) => (
                  <View style={{marginBottom: 20}}>
                    <TextInput
                      mode="outlined"
                      onBlur={onBlur}
                      error={!!error}
                      maxLength={10}
                      keyboardType="number-pad"
                      label="เลขภาษี(ถ้ามี)"
                      value={value ? value.toString() : ''}
                      onChangeText={onChange}
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />
              {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 50,
              }}>
              <Button onPress={handlePrevPage} icon={'arrow-left'} mode="text">
                <Text>ย้อนกลับ</Text>
              </Button>

             
            </View> */}
            </View>
          </>
        );
      // case 3:
      //   return (
      //     <>
      //       <Appbar.Header
      //         elevated
      //         mode="center-aligned"
      //         style={{
      //           backgroundColor: 'white',
      //         }}>
      //         <Appbar.BackAction onPress={handlePrevPage} />
      //         <Appbar.Content
      //           title="ตั้งค่าธุรกิจ"
      //           titleStyle={{fontSize: 18}}
      //         />
      //         <Button
      //           onPress={handleSave}
      //           disabled={ isUploading || isPending}
      //           mode="contained"
      //           loading={isPending || userLoading || isUploading}>
      //           บันทึก
      //         </Button>
      //       </Appbar.Header>
      //       <View style={{paddingHorizontal: 10, marginTop: 30}}>
      //         <Text
      //           style={{marginBottom: 10, fontSize: 16, fontWeight: 'bold'}}>
      //           เลือกหมวดหมู่ธุรกิจของคุณ
      //         </Text>
      //         <View>
      //           {categories.map((category: Category, index: number) => (
      //             <Controller
      //               control={control}
      //               name="categoryId"
      //               key={index}
      //               render={({field: {onChange, value}}) => (
      //                 <View
      //                   style={{
      //                     flexDirection: 'row',
      //                     alignItems: 'center',
      //                     marginTop: 20,
      //                   }}>
      //                   <Checkbox.Android
      //                     status={
      //                       value === category.key ? 'checked' : 'unchecked'
      //                     }
      //                     onPress={() => {
      //                       onChange(category.key);
      //                       setValue('categoryId', category.key, {
      //                         shouldDirty: true,
      //                       });
      //                     }}
      //                   />
      //                   <Text style={{fontSize: 16}}>{category.value}</Text>
      //                 </View>
      //               )}
      //             />
      //           ))}
      //         </View>
      //       </View>
      //     </>
      //   );

      default:
        return null;
    }
  };
  const progress = page / 2;

  return (
    <>
      <KeyboardAwareScrollView
        style={{flex: 1}}
        resetScrollToCoords={{x: 0, y: 0}}
        scrollEnabled={true}
        extraHeight={200} // Adjust this value as needed
        enableOnAndroid={true}>
        <View>{renderPage()}</View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default CreateCompanyScreen;

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    color: '#FFFFFF',
    borderRadius: 5,
    marginTop: 20,
    width: 100,
    height: 50, // Adjust as necessary
    padding: 10, // Adjust as necessary
  },

  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderRadius: 4,
    marginVertical: 10,
    height: 50,
    borderWidth: 0.5,
    borderColor: 'black',
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  loginButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: screenWidth - 50,
    height: 48,
    borderRadius: 10,
  },
});
