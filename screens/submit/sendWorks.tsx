import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useContext, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import {
  Appbar,
  Avatar,
  Button,
  Divider,
  IconButton,
  TextInput
} from 'react-native-paper';

import {
  ServicesEmbed,
  SubmissionStatus,
  Submissions,
  WorkStatus
} from '@prisma/client';
import Clipboard from '@react-native-clipboard/clipboard';
import { v4 as uuidv4 } from 'uuid';
import DatePickerButton from '../../components/styles/DatePicker';
import AddNewImage from '../../components/submission/after/addNew';
import AddNewBeforeImage from '../../components/submission/before/addNew';
import ProjectModalScreen from '../../components/webview/project';
import { useModal } from '../../hooks/quotation/create/useModal';
import useSelectedDates from '../../hooks/quotation/create/useSelectDates';
import useCreateSubmission from '../../hooks/submission/useSaveSubmission';
import { useUploadToFirebase } from '../../hooks/submission/useUploadToFirebase';
import useShare from '../../hooks/webview/useShare';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
import { ParamListBase } from '../../types/navigationType';
type Props = {
  navigation: StackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, 'SendWorks'>;
};
type LoadingStatus = {
  [index: number]: boolean;
};
type BeforeImageLoadingStatus = {
  [index: number]: boolean;
};

const width = Dimensions.get('window').width;

const SendWorks = (props: Props) => {
  const {route, navigation} = props;
  const {
    initialDateOfferFormatted,

    initialDateOffer,
  } = useSelectedDates();
  const {
    state: {code, editQuotation, companyState, fcmToken},
    dispatch,
  } = useContext(Store);

  if (!editQuotation || !companyState || !editQuotation.customer) {
    Alert.alert('ไม่พบข้อมูลใบเสนอราคา');
    navigation.goBack();
    return null;
  }
  const [dateOfferFormatted, setDateOfferFormatted] = useState<string>(
    initialDateOfferFormatted,
  );
  const queryClient = useQueryClient();
  const user = useUser();
  const [copied, setCopied] = useState(false);
  const imageRandomId = uuidv4();
  const [submissionId, setSubmissionId] = useState<string>('');
  const [submissionServerId, setSubmissionServerId] = useState<string | null>(
    null,
  );
  const {
    openModal: openProjectModal,
    closeModal: closeProjectModal,
    isVisible: showProjectModal,
  } = useModal();
  const url = `https://www.worktrust.co/submission/${submissionServerId}`;

  const [opneSubmissionModal, setOpenSubmissionModal] =
    useState<boolean>(false);
  const handleShare = useShare({
    url,
    title: `ส่งงานลูกค้า ${editQuotation.customer.name}`,
  });

  const methods = useForm<Submissions>({
    mode: 'all',
    defaultValues: {
      id: uuidv4(),
      address: editQuotation.customer.address || '',
      description: '',
      dateOffer: initialDateOffer,
      services: editQuotation.services,
      beforeImages: [],
      afterImages: [],
      workStatus: WorkStatus?.ALL,
      FCMToken: fcmToken,
      quotationRefNumber: editQuotation.docNumber,
      companyId: companyState.id,
      customer: editQuotation.customer,
      companyCode: code,
      quotationId: editQuotation.id,
      status: SubmissionStatus?.PENDING,
      createdAt: new Date(),
      companyName: companyState?.bizName ?? '',
      workers: editQuotation.workers ? editQuotation.workers : [],
      updatedAt: new Date(),
    } as unknown as Submissions,
  });
  const beforeImages = useWatch({
    control: methods.control,
    name: 'beforeImages',
  });
  const dateOffer = useWatch({control: methods.control, name: 'dateOffer'});
  const afterImages = useWatch({control: methods.control, name: 'afterImages'});
  const [viewResult, setViewResult] = React.useState('');
  const beforeImagesStoragePath = `${code}/submission/${editQuotation.docNumber}/beforeImages/${imageRandomId}`;
  const afterImagesStoragePath = `${code}/submission/${editQuotation.docNumber}/afterImages/${imageRandomId}`;
  const {isUploading, error, uploadImages} = useUploadToFirebase();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isBeforeImage, setIsBeforeImage] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  // const {isImagePicking: pickingBeforeImage, pickImage: pickBeforeImage} =
  //   usePickImage((uri: string) => {
  //     setValue('beforeImages', [...beforeImages, uri], {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //   });

  // const {isImagePicking: pickingAfterImage, pickImage: pickAfterImage} =
  //   usePickImage((uri: string) => {
  //     setValue('afterImages', [...afterImages, uri], {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //   });
  const services = useWatch({control: methods.control, name: 'services'});

  const actions: any = {
    setSubmissionServerId,
    openProjectModal,
  };
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({});
  const [loadingBeforeImageStatus, setLoadingBeforeImageStatus] =
    useState<BeforeImageLoadingStatus>({});

  const {mutate, isPending} = useCreateSubmission(actions);

  const removeService = (index: number) => {
    const updatedServices = services.filter((_: any, i: number) => i !== index);
    methods.setValue('services', updatedServices, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeBeforeImage = useCallback(
    (uri: string) => {
      // Filter out the image URI from the current state
      const updatedImages = beforeImages.filter(
        image => image.thumbnailUrl !== uri,
      );

      // Update the form state to reflect the change and optionally re-validate
      methods.setValue('beforeImages', updatedImages, {shouldValidate: true});
    },
    [beforeImages, methods.setValue],
  );
  const removeAfterImage = useCallback(
    (uri: string) => {
      // Filter out the image URI from the current state
      const updatedImages = afterImages.filter(
        image => image.thumbnailUrl !== uri,
      );

      // Update the form state to reflect the change and optionally re-validate
      methods.setValue('afterImages', updatedImages, {shouldValidate: true});
    },
    [afterImages, methods.setValue],
  );

  const handleDone = useCallback(async () => {
    // const uploadedBeforeImageUrls = await uploadImages(
    //   beforeImages,
    //   beforeImagesStoragePath,
    // );
    // const uploadedAfterImageUrls = await uploadImages(
    //   afterImages,
    //   afterImagesStoragePath,
    // );
    mutate({
      ...methods.getValues(),
      // beforeImages: uploadedBeforeImageUrls,
      // afterImages: uploadedAfterImageUrls,
      quotationId: editQuotation.id,
    });
  }, [beforeImages, afterImages, editQuotation, methods.getValues, mutate]);

  const handleStartDateSelected = (date: Date) => {
    methods.setValue('dateOffer', date);
  };

  const copyLinkToClipboard = () => {
    const link = `www.worktrust.co/submission/${submissionServerId}`;
    Clipboard.setString(link);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  React.useEffect(() => {
    if (services.length !== editQuotation.services.length) {
      methods.setValue('workStatus', WorkStatus.PERIOD, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      methods.setValue('workStatus', WorkStatus.ALL, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [services]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      afterImages.forEach(async (image, index) => {
        // ตรวจสอบสถานะของรูปภาพจาก Firebase functions หรือ URL
        if (image.thumbnailUrl && !loadingStatus[index]) {
          try {
            const response = await fetch(image.thumbnailUrl);
            if (response.ok) {
              setLoadingStatus(prev => ({...prev, [index]: false}));
            }
          } catch (error) {
            console.error('Error checking image:', error);
          }
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [afterImages, loadingStatus]);
  React.useEffect(() => {
    const interval = setInterval(() => {
      beforeImages.forEach(async (image, index) => {
        // ตรวจสอบสถานะของรูปภาพจาก Firebase functions หรือ URL
        if (image.thumbnailUrl && !loadingBeforeImageStatus[index]) {
          try {
            const response = await fetch(image.thumbnailUrl);
            if (response.ok) {
              setLoadingBeforeImageStatus(prev => ({...prev, [index]: false}));
            }
          } catch (error) {
            console.error('Error checking image:', error);
          }
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [beforeImages, loadingBeforeImageStatus]);

  return (
    <>
      <FormProvider {...methods}>
        <Appbar.Header
          elevated
          mode="center-aligned"
          style={{
            backgroundColor: 'white',
          }}>
          <Appbar.BackAction
            onPress={() => {
              navigation.goBack();
            }}
          />
          <Appbar.Content title="" />
          {submissionServerId && (
            <IconButton
              mode="outlined"
              icon="web"
              iconColor="gray"
              onPress={openProjectModal}
            />
          )}
          <Appbar.Content title="" />

          <Button
            loading={isUploading || isPending}
            disabled={!methods.formState.isValid || isUploading || isPending}
            mode="contained"
            // buttonColor={'#1b72e8'}
            onPress={handleDone}>
            {'บันทึก'}
          </Button>
        </Appbar.Header>
        <KeyboardAwareScrollView>
          <ScrollView
            style={{
              backgroundColor: '#FFFFFF',
              marginBottom: 100,
              paddingHorizontal: 20,
            }}>
            <View style={styles.card}>
              <Text style={styles.textHeader}>แจ้งส่งงาน</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',

                  marginVertical: 15,
                  alignContent: 'center',
                }}>
                <Text style={styles.title}> ใบเสนอราคาเลขที่ </Text>
                <Text>{editQuotation.docNumber}</Text>
              </View>
              <Divider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',

                  marginVertical: 15,
                  alignContent: 'center',
                }}>
                <Text style={styles.title}>ลูกค้า </Text>
                <Text>{editQuotation.customer.name}</Text>
              </View>
            </View>

            <View style={styles.stepContainer} />
            <Divider />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.titleDate}>วันที่ส่งงาน</Text>
              <View style={{marginTop: 10, marginLeft: 10}}>
                <DatePickerButton
                  title="วันที่ส่งงาน"
                  label=""
                  date={new Date(dateOffer)}
                  onDateSelected={handleStartDateSelected}
                />
              </View>
            </View>

            <Divider />
            <View style={{alignSelf: 'flex-start', marginVertical: 15}}>
              <Text style={styles.title}>หนังสือส่งงานทำขึ้นที่</Text>
              <Controller
                control={methods.control}
                name="address"
                rules={{required: true}}
                render={({
                  field: {onChange, onBlur, value},
                  fieldState: {error},
                }) => (
                  <View>
                    <TextInput
                      multiline
                      style={styles.input}
                      error={!!error}
                      mode="outlined"
                      numberOfLines={4}
                      placeholder="สถาณที่ติดตั้งงาน เลขที่ ถนน ตำบล อำเภอ จังหวัด...."
                      placeholderTextColor={'#A6A6A6'}
                      keyboardType="default"
                      onChangeText={onChange}
                      textAlignVertical="top"
                      value={value}
                    />
                    {error && (
                      <Text style={{color: 'red', marginTop: 5}}>
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
            <Divider style={{marginBottom: 20}} />

            <View>
              <Text style={styles.title}>งานที่แจ้งส่ง</Text>
              {services.map((service: ServicesEmbed, index: number) => (
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'space-between',
                    maxWidth: width *0.75,
                    gap: 10,
                  }}
                  key={index}>
                  <View>
                    <Text style={styles.listTitle}>
                      {index + 1}. {service.title}
                    </Text>
                    <Text style={styles.listDescription}>
                      {service.description}
                    </Text>
                  </View>

                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="gray"
                    onPress={() => removeService(index)}
                  />
                </View>
              ))}
            </View>

            <Divider style={{marginVertical: 20}} />

            <View>
              {editQuotation.workers && editQuotation.workers.length > 0 && (
                <View>
                  <Text style={styles.title}>พนักงานติดตั้ง</Text>
                  <FlatList
                    data={editQuotation.workers}
                    horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <View style={styles.workers}>
                          <Avatar.Image
                            size={100}
                            source={{uri: item.image ? item.image : ''}}
                          />

                          <Text>{item.name}</Text>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </View>
              )}
            </View>
            <Divider style={{marginVertical: 20}} />
            <View>
              <Text style={styles.title}>รูปก่อนทำงาน</Text>
              <FlatList
                data={beforeImages}
                horizontal={true}
                renderItem={({item, index}) => (
                  <View key={index} style={styles.imageContainer}>
                    {loadingBeforeImageStatus[index] !== false ? (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <Image
                        source={{uri: item.thumbnailUrl}}
                        style={styles.image}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.closeIcon}
                      onPress={() => removeBeforeImage(item.thumbnailUrl)}>
                      <FontAwesomeIcon icon={faClose} size={15} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={
                  beforeImages.length > 0 ? (
                    <IconButton
                      icon={'plus'}
                      // loading={pickingBeforeImage}
                      style={styles.addButtonContainer}
                      onPress={() => {
                        setIsBeforeImage(true);
                      }}></IconButton>
                  ) : null
                }
                ListEmptyComponent={
                  <IconButton
                    icon={'plus'}
                    // loading={pickingBeforeImage}
                    style={styles.addButtonContainer}
                    onPress={() => {
                      setCheckLoading(true);

                      setIsBeforeImage(true);
                    }}></IconButton>
                }
              />
            </View>
            <Divider style={{marginVertical: 10}} />
            <View>
              <Text style={styles.title}>รูปหลังทำงาน</Text>
              <FlatList
                data={afterImages}
                horizontal={true}
                renderItem={({item, index}) => (
                  <View key={index} style={styles.imageContainer}>
                    {loadingStatus[index] !== false ? (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <Image
                        source={{uri: item.thumbnailUrl}}
                        style={styles.image}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.closeIcon}
                      onPress={() => removeAfterImage(item.thumbnailUrl)}>
                      <FontAwesomeIcon icon={faClose} size={15} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={
                  afterImages.length > 0 ? (
                    <IconButton
                      icon={'plus'}
                      // loading={pickingAfterImage}
                      style={styles.addButtonContainer}
                      onPress={() => setIsOpenModal(true)}></IconButton>
                  ) : null
                }
                ListEmptyComponent={
                  <IconButton
                    icon={'plus'}
                    // loading={pickingAfterImage}
                    style={styles.addButtonContainer}
                    onPress={() => setIsOpenModal(true)}></IconButton>
                }
              />
            </View>
            <Divider style={{marginVertical: 10}} />

            <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
              <Text style={styles.title}>รายละเอียดงานที่ส่ง</Text>
              <Controller
                control={methods.control}
                rules={{required: true}}
                name="description"
                render={({
                  field: {onChange, onBlur, value},
                  fieldState: {error},
                }) => (
                  <TextInput
                    error={!!error}
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                    mode="outlined"
                    placeholder="อธิบายภาพรวมของงานที่ส่งมอบ เช่นคุณได้ทำอะไรบ้างในงวดงานนี้.."
                    onBlur={onBlur}
                    keyboardType="default"
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={'#A6A6A6'}
                  />
                )}
              />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        {submissionServerId && (
          <>
            <ProjectModalScreen
              fileName={editQuotation.customer.name}
              visible={showProjectModal}
              onClose={closeProjectModal}
              url = {url}
            />
          </>
        )}
        <Modal
          isVisible={isOpenModal}
          style={styles.modal}
          onBackdropPress={() => setIsOpenModal(false)}>
          <AddNewImage
            isVisible={isOpenModal}
            onClose={() => setIsOpenModal(false)}
          />
        </Modal>
        <Modal
          isVisible={isBeforeImage}
          style={styles.modal}
          onBackdropPress={() => setIsOpenModal(false)}>
          <AddNewBeforeImage
            isVisible={isBeforeImage}
            onClose={() => setIsBeforeImage(false)}
          />
        </Modal>
      </FormProvider>
    </>
  );
};

export default SendWorks;


const styles = StyleSheet.create({
  containerForm: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  headerForm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
  },
  headerTextForm: {
    fontFamily: 'sukhumvit set',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  formInput: {
    flex: 1,
    marginTop: 5,
  },
  rowForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelSuffix: {
    fontFamily: 'sukhumvit set',
    fontSize: 16,
    marginLeft: 5,
  },
  outlinedButtonForm: {
    backgroundColor: 'transparent',
  },
  outlinedButtonTextForm: {
    color: '#0073BA',
  },
  roundedButton: {
    marginTop: 10,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#0073BA',
    borderRadius: 5,
    height: 50,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewForm: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputContainerForm: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: 100,
  },
  label: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 10,
  },
  inputForm: {
    // backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 0.5,
    width: width * 0.85,

    height: 50,

    paddingHorizontal: 10,
  },
  inputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputSuffix: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  inputFormRight: {
    flex: 1,
    // backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    minHeight: 50,
    minWidth: 200,

    width: 50,
  },
  imageContainer: {
    width: width / 3 - 10,
    position: 'relative',

    marginTop: 20,

    flexDirection: 'column',
    margin: 5,
  },
  workers: {
    flexDirection: 'column',
    marginTop: 20,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  closeIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    padding: 5,
    backgroundColor: 'red', // Set the background color to red
    borderRadius: 50, // Make it circular
    width: 20, // Set a fixed width
    height: 20, // Set a fixed height
    justifyContent: 'center', // Center the icon horizontally
    alignItems: 'center', // Center the icon vertically
  },
  buttonContainerForm: {
    marginTop: 20,
    // backgroundColor: '#007AFF',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
  },
  submitedButtonForm: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonPrevContainerForm: {
    marginTop: 20,
    borderColor: '#0073BA',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
  },
  buttonTextForm: {
    color: '#FFFFFF',
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    bottom: 0,

    width: '100%',

    paddingBottom: 30,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#A6A6A6',
    marginTop: 1,
  },

  buttonForm: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    height: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  previousButtonForm: {
    borderColor: '#0073BA',
    backgroundColor: 'white',
  },
  smallInput: {
    width: '30%',
  },
  stepContainer: {
    paddingHorizontal: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  textHeader: {
    fontSize: 24,
    fontFamily: 'SukhumvitSet-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343a40',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.3,
    // shadowRadius: 3,

    width: '100%',
    alignSelf: 'baseline',
    marginTop: 20,
  },
  iconForm: {
    color: 'white',
    marginLeft: 10,
    marginTop: 2,
  },
  iconPrevForm: {
    // color: '#007AFF',
    color: '#0073BA',

    marginLeft: 10,
  },
  input: {
    borderWidth: 0.5,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    minHeight: Platform.OS === 'ios' ? 80 : 40, // Adjust as needed
    textAlignVertical: 'top', // Ensure text aligns to the top
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
    width: width * 0.85,
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#19232e',
  },
  listTitle: {
    fontSize: 14,
    marginTop: 20,
  },
  listDescription: {
    fontSize: 12,
  },
  addButtonContainer: {
    width: 100,
    margin: 5,
    marginTop: 20,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0073BA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
  titleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#19232e',
  },
});
