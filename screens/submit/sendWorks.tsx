import {faClose} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import { nanoid } from 'nanoid';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useContext, useState} from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useWatch,
  useFieldArray,
} from 'react-hook-form';
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import {
  Appbar,
  Avatar,
  Button,
  Divider,
  IconButton,
  TextInput,
} from 'react-native-paper';

import {
  ServicesEmbed,
  SubmissionImagesPairEmbed,
  SubmissionStatus,
  Submissions,
  SubmissionBeforeImagesEmbed,
  SubmissionAfterImagesEmbed,
  WorkStatus,
} from '@prisma/client';
import Clipboard from '@react-native-clipboard/clipboard';
import DatePickerButton from '../../components/styles/DatePicker';
import AddNewImage from '../../components/submission/after/addNew';
import AddNewBeforeImage from '../../components/submission/before/addNew';
import ProjectModalScreen from '../../components/webview/project';
import {useModal} from '../../hooks/quotation/create/useModal';
import useSelectedDates from '../../hooks/quotation/create/useSelectDates';
import useCreateSubmission from '../../hooks/submission/useCreate';
import {useUploadToFirebase} from '../../hooks/submission/useUploadToFirebase';
import useShare from '../../hooks/webview/useShare';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import {ParamListBase} from '../../types/navigationType';
import SubmissionViewScreen from '../../components/webview/submission';
import useUpdateSubmission from '../../hooks/submission/useUpdate';
import { set } from 'lodash';
import { initialImagePair } from '../../models/InitialState';
import { ISubmissions } from 'models/Submissions';
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

const {width, height} = Dimensions.get('window');

const SendWorks = (props: Props) => {
  const {route, navigation} = props;
  const {
    initialDateOfferFormatted,

    initialDateOffer,
  } = useSelectedDates();
  const {
    state: {
      code,
      editQuotation,
      G_company: companyState,
      fcmToken,
      editSubmission,
      quotationId,
    },
    dispatch,
  } = useContext(Store);
  const [dateOfferFormatted, setDateOfferFormatted] = useState<string>(
    initialDateOfferFormatted,
  );
  const queryClient = useQueryClient();
  const user = useUser();
  const [copied, setCopied] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
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

  const initialSubmission: ISubmissions = {
    id: nanoid(),
    address: editQuotation ? editQuotation.customer.address : '',
    description: '',
    dateOffer: initialDateOffer,
    services: editQuotation ? editQuotation.services : [],
    reject: null,
    inspector: null,
    reviews: [],
    workStatus: WorkStatus?.ALL,
    reSubmissionId: null,
    history: false,
    FCMToken: fcmToken,
    imagesPair: [initialImagePair],
    quotationRefNumber: editQuotation ? editQuotation.docNumber : '',
    companyId: companyState ? companyState.id : '',
    customer: editQuotation ? editQuotation.customer : (null as any),
    companyCode: code,
    status: SubmissionStatus?.PENDING,
    createdAt: new Date(),
    companyName: companyState?.bizName ?? '',
    workers: editQuotation ? editQuotation.workers : [],
    updatedAt: new Date(),
  };
  const methods = useForm<ISubmissions>({
    mode: 'all',
    defaultValues: editSubmission ? editSubmission : initialSubmission,
  });
  const {fields, append, remove, update} = useFieldArray({
    control: methods.control,
    name: 'imagesPair',
  });
  const handleAddImagePair = () => {
    append(initialImagePair);
  };
  // const beforeImages = useWatch({
  //   control: methods.control,
  //   name: 'beforeImages',
  // });

  const imagesPair = useWatch({
    control: methods.control,
    name: 'imagesPair',
  });
  const dateOffer = useWatch({control: methods.control, name: 'dateOffer'});
  // const afterImages = useWatch({control: methods.control, name: 'afterImages'});
  const {isUploading, error, uploadImages} = useUploadToFirebase();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const services = useWatch({control: methods.control, name: 'services'});
  const [modalOpen, setModalOpen] = useState(false);

  const actions: any = {
    setSubmissionServerId,
    openProjectModal: () => {
      setOpenSubmissionModal(true);
    },
  };
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({});
  const [loadingBeforeImageStatus, setLoadingBeforeImageStatus] =
    useState<BeforeImageLoadingStatus>({});

  const {mutate, isPending} = useCreateSubmission(actions);
  const {mutate: editQuotationMutation, isPending: isUpdating} =
    useUpdateSubmission(actions);

  const removeService = (index: number) => {
    const updatedServices = services.filter((_: any, i: number) => i !== index);
    methods.setValue('services', updatedServices, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const quotationRefNumber = useWatch({
    control: methods.control,
    name: 'quotationRefNumber',
  });

  const customerName = useWatch({
    control: methods.control,
    name: 'customer.name',
  });
  const workers = useWatch({
    control: methods.control,
    name: 'workers',
  });

  const handleDone = useCallback(async () => {
    if (editSubmission) {
      editQuotationMutation({
        submission: methods.getValues(),
      });
      return;
    } else {
      mutate({
        ...methods.getValues(),
        quotationId,
      });
    }
  }, [editQuotation, methods.getValues, mutate, editSubmission]);
  const watchedFields = useWatch({
    control: methods.control,
    name: 'imagesPair',
    defaultValue: initialSubmission.imagesPair,
  });
  const handleStartDateSelected = (date: Date) => {
    methods.setValue('dateOffer', date);
  };
  const removeImageItem = (index: number, imageType: 'beforeImages' | 'afterImages', imageItem: SubmissionAfterImagesEmbed | SubmissionBeforeImagesEmbed) => {
    const currentImages = watchedFields[index][imageType];
    const filteredImages = currentImages.filter(img => img.thumbnailUrl !== imageItem.thumbnailUrl);
    methods.setValue(`imagesPair.${index}.${imageType}`, filteredImages);
  };
  React.useEffect(() => {
    if (editQuotation) {
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
    } else if (editSubmission) {
      if (services.length !== editSubmission.services.length) {
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
    }
  }, [services]);

  React.useEffect(() => {
    if (modalOpen) {
      setShowUploadModal(true);
    }
  }, [modalOpen, showUploadModal, imageType, selectedIndex, label, title]);
  

  const handleOpenModal = (index: number, imageType: string, label: string, title:string) => {
    setImageType(imageType);
    setTitle(title);
    setLabel(label);
    setSelectedIndex(index);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setShowUploadModal(false);
    setImageType(null);
    setLabel(null);
    setSelectedIndex(null);
    setTitle(null);
  };

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
          <IconButton
            mode="outlined"
            icon="navigation-variant"
            iconColor="#047e6e"
            disabled={!submissionServerId}
            onPress={() => setOpenSubmissionModal(true)}
          />
          <Appbar.Content title="" />

          <Button
            loading={isUploading || isPending || isUpdating}
            disabled={
              !methods.formState.isValid ||
              isUploading ||
              isPending ||
              isUpdating
            }
            mode="contained"
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
                <Text>{quotationRefNumber}</Text>
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
                <Text>{customerName}</Text>
              </View>
            </View>

            <View style={styles.stepContainer} />
            <Divider />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: 15,
              }}>
              <Text style={styles.titleDate}>วันที่แจ้งส่งงาน</Text>
              <View>
                <DatePickerButton
                  title="วันที่แจ้งส่งงาน"
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
                      mode={'outlined'}
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
                    maxWidth: width * 0.9,
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
              {workers.length > 0 && (
                <View>
                  <Text style={styles.title}>พนักงานติดตั้ง</Text>
                  <FlatList
                    data={workers}
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
                  <Divider style={{marginVertical: 20}} />
                </View>
              )}
            </View>
            {fields.map((item, index) => (
              <View
                key={item.id}
                style={{
                  marginBottom: 20,
                  padding: 10,
                  borderColor: 'gray',
                  borderWidth: 0.5,
                  borderRadius: 8,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Text style={styles.title}> หน้างานจุดที่ {index + 1}</Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="gray"
                    onPress={() => remove(index)}
                  />
                </View>
                <Text style={styles.subTitle}>
                  รูปก่อนทำงาน จุดที่ {index + 1}
                </Text>
                <FlatList
                  data={watchedFields[index]?.beforeImages || []}
                  horizontal={true}
                  renderItem={({item: imageItem}) => (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{uri: imageItem.thumbnailUrl}}
                        style={styles.image}
                      />
                      {imageItem && (
                        <TouchableOpacity
                          style={styles.closeIcon}
                          onPress={() => removeImageItem(index, 'beforeImages', imageItem)}                          >
                          <FontAwesomeIcon
                            icon={faClose}
                            size={15}
                            color="white"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  keyExtractor={(imageItem, imageIndex) =>
                    imageIndex.toString()
                  }
                  ListFooterComponent={
                    watchedFields[index]?.beforeImages?.length > 0 ? (
                      <View style={styles.addButtonContainer}>
                        <IconButton
                          icon={'plus'}
                          iconColor={'#047e6e'}
                          onPress={() =>
                            handleOpenModal(
                              index,
                              'beforeImages',
                              'เพิ่มรูปหน้างานก่อนติดตั้ง',
                              'หน้างานก่อนติดตั้ง'
                            )
                          }
                        />
                      </View>
                    ) : null
                  }
                  ListEmptyComponent={
                    <View style={styles.addButtonContainer}>
                      <IconButton
                        icon={'plus'}
                        iconColor={'#047e6e'}
                        onPress={() =>
                          handleOpenModal(
                            index,
                            'beforeImages',
                            'เพิ่มรูปหน้างานก่อนติดตั้ง',
                            'หน้างานก่อนติดตั้ง'

                          )
                        }
                      />
                    </View>
                  }
                />
                <Divider style={{marginVertical: 10}} />
                <Text style={styles.subTitle}>
                  รูปหลังทำงาน จุดที่ {index + 1}
                </Text>
                <FlatList
                  data={watchedFields[index]?.afterImages || []}
                  horizontal={true}
                  renderItem={({item: imageItem}) => (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{uri: imageItem.thumbnailUrl}}
                        style={styles.image}
                      />
                      {imageItem && (
                        <TouchableOpacity
                          style={styles.closeIcon}
                          onPress={() => removeImageItem(index, 'afterImages', imageItem)}
                          >
                          <FontAwesomeIcon
                            icon={faClose}
                            size={15}
                            color="white"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  keyExtractor={(imageItem, imageIndex) =>
                    imageIndex.toString()
                  }
                  ListFooterComponent={
                    watchedFields[index]?.afterImages?.length > 0 ? (
                      <View style={styles.addButtonContainer}>
                        <IconButton
                          icon={'plus'}
                          iconColor={'#047e6e'}
                          onPress={() =>
                            handleOpenModal(
                              index,
                              'afterImages',
                              'เพิ่มรูปผลงานหลังติดตั้ง',
                                        'ผลงานหลังติดตั้ง'
                            )
                          }
                        />
                      </View>
                    ) : null
                  }
                  ListEmptyComponent={
                    <View style={styles.addButtonContainer}>
                      <IconButton
                        icon={'plus'}
                        iconColor={'#047e6e'}
                        onPress={() =>
                          handleOpenModal(
                            index,
                            'afterImages',
                            'เพิ่มรูปผลงานหลังติดตั้ง',
                            'ผลงานหลังติดตั้ง'

                          )
                        }
                      />
                    </View>
                  }
                />
              </View>
            ))}

            <Button
              style={{
                width: width * 0.45,
                alignSelf: 'flex-end',
                marginTop: -20,
              }}
              mode="text"
              icon={'plus'}
              onPress={handleAddImagePair}>
              เพิ่มรูปหน้างานจุดที่ {fields.length + 1}
            </Button>

            <View style={{alignSelf: 'flex-start', marginVertical: 20}}>
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
            <SubmissionViewScreen
              fileName={customerName}
              visible={opneSubmissionModal}
              onClose={() => setOpenSubmissionModal(false)}
              url={url}
            />
          </>
        )}

        {label && imageType && title && selectedIndex !== null && (
          <Modal
            isVisible={showUploadModal}
            style={styles.modal}
            onBackdropPress={handleCloseModal}>
            <AddNewBeforeImage
            title={title}
              label={label}
              selectedIndex={selectedIndex}
              imageType={imageType}
              isVisible={showUploadModal}
              onClose={handleCloseModal}
            />
          </Modal>
        )}
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

    marginTop: 10,

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
    textAlign: 'left',
  },
  subTitle: {
    fontSize: 14,
    // fontWeight: 'bold',

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
    width: width / 4 - 10,
    margin: 5,
    marginTop: 10,
    height: height / 8,

    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#047e6e',
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
