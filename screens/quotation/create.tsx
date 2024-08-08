import {faBriefcase, faUser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import firebase from '../../firebase';
import * as stateAction from '../../redux/actions';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Divider,
  Icon,
  IconButton,
  Switch,
  TextInput,
} from 'react-native-paper';
import AddServices from '../../components/AddServices';
import CardClient from '../../components/CardClient';
import CardProject from '../../components/CardProject';
import DocNumber from '../../components/DocNumber';
import Summary from '../../components/Summary';
import AddCustomer from '../../components/add/AddCustomer';
import SelectProductModal from '../../components/service/select';
import DatePickerButton from '../../components/styles/DatePicker';
// import Divider from '../../components/styles/Divider';
import {yupResolver} from '@hookform/resolvers/yup';

import {CompanyState} from 'types';
import {ValidationError} from 'yup';
import UpdateServiceModal from '../../components/service/update';
import SmallDivider from '../../components/styles/SmallDivider';
import AddCard from '../../components/ui/Button/AddCard';
import SignatureSection from '../../components/ui/SignatureSection';
import WarrantyModal from '../../components/warranty/create';
import PDFModalScreen from '../../components/webview/pdf';
import ProjectModalScreen from '../../components/webview/project';
import ExistingWorkers from '../../components/workers/existing';
import useCreateQuotation from '../../hooks/firestore/quotations/useSaveQuotation';
import {useModal} from '../../hooks/quotation/create/useModal';
import useSelectedDates from '../../hooks/quotation/create/useSelectDates';
import useUpdateQuotation from '../../hooks/quotation/update/useUpdateQuotations';
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import {
  DiscountType,
  QuotationStatus,
  TaxType,
  WarrantyStatus,
} from '../../types/enums';

import {Store} from '../../redux/store';
import {ParamListBase} from '../../types/navigationType';
import {nanoid} from 'nanoid';
import { IServiceEmbed } from 'types/interfaces/ServicesEmbed';
import { IQuotations } from '../../models/Quotations';
import { IQuotationEventsEmbed } from 'types/interfaces/QuotationEventsEmbed';
import { ISellerEmbed } from 'types/interfaces/SellerEmbed';
import { CreateQuotationSchema, CreateQuotationSchemaType } from '../../validation/quotations/create';
import { defalutCustomer, initialWarranty } from '../../models/InitialState';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'CreateQuotation'>;
}

const CreateQuotation = ({navigation}: Props) => {
  const {
    state: {
      G_company,
      editQuotation,
      defaultWarranty,
      sellerUid,
      fcmToken,
      companyId,
      existingServices,
      G_user,
    },
    dispatch,
  } = useContext(Store);
  if (!G_company || !G_user) {
    return null;
  }
  const {
    initialDocnumber,
    initialDateOfferFormatted,
    initialDateEndFormatted,
    initialDateEnd,
    initialDateOffer,
  } = useSelectedDates();

  const thaiDateFormatter = useThaiDateFormatter();
  const [workerPicker, setWorkerpicker] = useState(false);
  const [quotationServerId, setQuotationServerId] = useState<string | null>(
    editQuotation ? editQuotation.id : null,
  );
  const {firestore} = firebase;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [isLoadingWebP, setIsLoadingWebP] = useState(false);
  const [currentValue, setCurrentValue] = useState<IServiceEmbed | null>(null);

  const [dateOfferFormatted, setDateOfferFormatted] = useState<string>(
    initialDateOfferFormatted,
  );
  const [dateEndFormatted, setDateEndFormatted] = useState<string>(
    initialDateEndFormatted,
  );
  const [isNewQuotation, setIsNewQuotation] = useState(
    editQuotation ? false : true,
  );

  const [serviceIndex, setServiceIndex] = useState<number>(0);

  // const url = `https://project.worktrust.co/preview/seller/${quotationServerId}`;
  let urlPreview = `https://project.worktrust.co/preview/seller/${quotationServerId}`;
  let urlShare = `https://project.worktrust.co/preview/${quotationServerId}`;

  const {
    openModal: openAddCustomerModal,
    closeModal: closeAddCustomerModal,
    isVisible: addCustomerModal,
  } = useModal();
  const {
    openModal: openWorkerModal,
    closeModal: closeWorkerModal,
    isVisible: workerModal,
  } = useModal();
  const {
    openModal: openSignatureModal,
    closeModal: closeSignatureModal,
    isVisible: signatureModal,
  } = useModal();
  const {
    openModal: openContractModal,
    closeModal: closeContractModal,
    isVisible: contractModal,
  } = useModal();
  const {
    openModal: openPDFModal,
    closeModal: closePDFModal,
    isVisible: showPDFModal,
  } = useModal();
  const {
    openModal: openProjectModal,
    closeModal: closeProjectModal,
    isVisible: showProjectModal,
  } = useModal();
  const {
    openModal: openAddExistingServiceModal,
    closeModal: closeAddExistingServiceModal,
    isVisible: showAddExistingService,
  } = useModal();
  const {
    openModal: openEditServiceModal,
    closeModal: closeEditServiceModal,
    isVisible: showEditServiceModal,
  } = useModal();

  const [visibleModalIndex, setVisibleModalIndex] = useState<number | null>(
    null,
  );
  const sellerEmbed: ISellerEmbed = {
    bizName: G_company.bizName,
    jobPosition: G_user.jobPosition ? G_user.jobPosition : '',
    sellerName: G_user.name ? G_user.name : '',
    logo: G_company.logo ? G_company.logo : '',
    address: G_company.address,
    mobileTel: G_company.mobileTel ? G_company.mobileTel : '',
    officeTel: G_company.officeTel ? G_company.officeTel : '',
    companyTax: G_company.companyTax ? G_company.companyTax : '',
    email: G_user.email ? G_user.email : '',
  };
  const eventEmbed: IQuotationEventsEmbed = {
    pageView: 0,
    download: 0,
    print: 0,
    share: 0,
    createdAt: new Date(),
    lastOccurredAt: new Date(),

  };

  const quotationDefaultValues: CreateQuotationSchemaType = {
    id: nanoid(),
    isArchived: false,
    created: null,
    updated: null,
    services: [],
    // events: null,
    customer: defalutCustomer,
    // customerSign: null,
    companyId : G_user.currentCompanyId,
    vat7: 0,
    taxType: TaxType.NOTAX,
    taxValue: 0,
    summary: 0,
    warrantyStatus: WarrantyStatus.PENDING,
    summaryAfterDiscount: 0,
    sellerUid : sellerUid? sellerUid: G_user.uid,
    discountType: DiscountType.PERCENT,
    discountPercentage: 3,
    discountValue: 0,
    allTotal: 0,
    dateOffer: initialDateOffer,
    noteToCustomer: '',
    noteToTeam: '',
    sellerEmbed,
    dateEnd: initialDateEnd,
    docNumber: `QT${initialDocnumber}`,
    workers: [],
    FCMToken: fcmToken,
    sellerSignature: '',
    warranty: defaultWarranty ? defaultWarranty : initialWarranty,
    status: QuotationStatus.PENDING, // Set the status to a valid QuotationStatus value
    pdfUrl: null,
  };

  const methods = useForm<CreateQuotationSchemaType>({
    mode: 'onChange',
    defaultValues: editQuotation ? editQuotation : quotationDefaultValues,
    resolver: yupResolver(CreateQuotationSchema),
  });
  const {fields, append, remove, update} = useFieldArray({
    control: methods.control,
    name: 'services',
  });

  const customer = useWatch({
    control: methods.control,
    name: 'customer',
  });

  const warranty = useWatch({
    control: methods.control,
    name: 'warranty',
  });

  const dateOffer = useWatch({
    control: methods.control,
    name: 'dateOffer',
  });
  const dateEnd = useWatch({
    control: methods.control,
    name: 'dateEnd',
  });

  const workers = useWatch({
    control: methods.control,
    name: 'workers',
  });
  const services = useWatch({
    control: methods.control,
    name: 'services',
  });
  const sellerSignature = useWatch({
    control: methods.control,
    name: 'sellerSignature',
  });

  const noteToTeam = useWatch({
    control: methods.control,
    name: 'noteToTeam',
  });

  const noteToCustomer = useWatch({
    control: methods.control,
    name: 'noteToCustomer',
  });

  const isCustomerDisabled = useMemo(() => {
    return customer.name === '' && customer.address === '';
  }, [customer.name, customer.address]);

  const isDisabled = useMemo(
    () =>
      !customer.name ||
      services.length === 0 ||
      warranty.productWarrantyMonth <= 0 ||
      warranty.skillWarrantyMonth <= 0,
    [
      customer.name,
      services.length,
      warranty.productWarrantyMonth,
      warranty.skillWarrantyMonth,
    ],
  );
  useEffect(() => {
    methods.setValue('FCMToken', fcmToken);
  }, [dateEndFormatted, fcmToken, methods]);

  const [openNoteToCustomer, setOpenNoteToCustomer] = useState(
    noteToCustomer ? true : false,
  );
  const [openNoteToTeam, setOpenNoteToTeam] = useState(
    noteToTeam ? true : false,
  );

  const useWorkers = () => {
    if (workers.length > 0) {
      methods.setValue('workers', [], {shouldDirty: true});
      closeWorkerModal();
    } else {
      openWorkerModal();
    }
  };

  const handleModalClose = () => {
    setVisibleModalIndex(null);
  };
  const handleEditService = (index: number, currentValue: IServiceEmbed) => {
    handleModalClose();
    setCurrentValue(currentValue);
    setServiceIndex(index);
  };

  const actions: any = {
    setQuotationServerId,
    setPdfUrl,
    openProjectModal,
  };
  console.log('COMPANY ID', G_company);

  const {mutate: updateQuotation, isPending: isUpdatePending} =
    useUpdateQuotation(actions);
  const {createQuotationHandler} = useCreateQuotation(actions);

  const handleButtonPress = async () => {
    try {
      if (isNewQuotation) {
        // const varidatedQuotation = await QuotationValidationSchema.validate(
        //   methods.getValues(),
        // );
        const success = await createQuotationHandler(
          methods.getValues(),
        );
        if (!success) {
          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
        }
        console.log('GOOD QUERY')
        // await fetchQuotations(G_user.uid, navigation, dispatch, stateAction);
      } else {
        const existingData = {
          ...methods.getValues(),
          id: quotationServerId,
        };
        const data = {
          quotation: existingData as IQuotations,
          company: G_company as CompanyState,
        };
        // updateQuotation(data);
      }
    } catch (error: any) {
      if (error instanceof ValidationError) {
        // Handle validation errors
        Alert.alert('Validation Error', error.errors.join('\n'));
      } else {
        // Handle other types of errors
        console.log('error', error);
        Alert.alert('ข้อผิดพลาด', error.message);
      }
    }
  };
  const handleInvoiceNumberChange = (text: string) => {
    methods.setValue('docNumber', text);
  };

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);
    remove(index);
  };

  const handleStartDateSelected = (date: Date) => {
    setDateOfferFormatted(thaiDateFormatter(date));
    methods.setValue('dateOffer', date);
  };

  const handleEndDateSelected = (date: Date) => {
    setDateEndFormatted(thaiDateFormatter(date));
    methods.setValue('dateEnd', date, {shouldValidate: true});
  };

  React.useEffect(() => {
    if (currentValue) {
      openEditServiceModal();
    } else {
      closeEditServiceModal();
    }
    if (!openNoteToCustomer) {
      methods.setValue('noteToCustomer', null, {shouldDirty: true});
    }
    if (!openNoteToTeam) {
      methods.setValue('noteToTeam', null, {shouldDirty: true});
    }
  }, [
    currentValue,
    openNoteToCustomer,
    openNoteToTeam,
    openEditServiceModal,
    closeEditServiceModal,
    methods,
  ]);

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
              if (methods.formState.isDirty) {
                Alert.alert(
                  'ปิดหน้าต่าง',
                  'ยืนยันไม่บันทึกข้อมูลและปิดหน้าต่าง',
                  [
                    // The "No" button
                    // Does nothing but dismiss the dialog when pressed
                    {
                      text: 'อยู่ต่อ',
                      style: 'cancel',
                    },
                    // The "Yes" button
                    {
                      text: 'ปิดหน้าต่าง',
                      onPress: () => navigation.goBack(),
                    },
                  ],
                  {cancelable: false},
                );
              } else {
                navigation.goBack();
              }
            }}
          />
          <Appbar.Content title="" />
          <IconButton
            disabled={!quotationServerId}
            icon="navigation-variant"
            mode="outlined"
            iconColor="#047e6e"
            onPress={openProjectModal}
          />

          {/* <IconButton
            disabled={!pdfUrl && !editQuotation?.pdfUrl}
            icon="file-document"
            mode="outlined"
            iconColor="#047e6e"
            onPress={openPDFModal}
          /> */}
          <Appbar.Content title="" />

          <Button
            loading={isUpdatePending}
            disabled={
              isDisabled || isUpdatePending || !methods.formState.isDirty
            }
            testID="submited-button"
            mode="contained"
            onPress={handleButtonPress}>
            {'บันทึก'}
          </Button>
        </Appbar.Header>
        {/* <ProgressBar progress={0.5} /> */}

        <View style={{flex: 1}}>
          <KeyboardAwareScrollView style={styles.container}>
            <View style={styles.subContainerHead}>
              <Text style={styles.textHeader}>ใบเสนอราคา</Text>
              <DatePickerButton
                label="วันที่เสนอราคา"
                title="วันที่เสนอราคา"
                date={dateOffer}
                onDateSelected={handleStartDateSelected}
              />

              <DatePickerButton
                label="ยืนราคาถึงวันที่ี"
                title="ยืนราคาถึงวันที่ี"
                date={dateEnd}
                onDateSelected={handleEndDateSelected}
              />
              <DocNumber
                label="เลขที่เอกสาร"
                onChange={handleInvoiceNumberChange}
                value={methods.watch('docNumber')}
              />
            </View>
            <View style={styles.subContainer}>
              <View style={{marginVertical: 20}}>
                {!isCustomerDisabled ? (
                  <CardClient handleEditClient={() => openAddCustomerModal()} />
                ) : (
                  <>
                    <View style={styles.header}>
                      <FontAwesomeIcon
                        icon={faUser}
                        color="#19232e"
                        size={18}
                      />
                      <Text style={styles.label}>ลูกค้า</Text>
                    </View>
                    <AddCard
                      buttonName="เพิ่มลูกค้า"
                      handleAdd={() => openAddCustomerModal()}
                    />
                  </>
                )}
              </View>
              <View style={styles.header}>
                <FontAwesomeIcon icon={faBriefcase} color="#19232e" size={18} />

                <Text style={styles.label}>บริการ-สินค้า</Text>
              </View>
              {fields.length > 0 &&
                fields.map((field :any , index: number) => (
                  <CardProject
                    handleModalClose={handleModalClose}
                    visibleModalIndex={visibleModalIndex === index}
                    setVisibleModalIndex={() => setVisibleModalIndex(index)}
                    index={index}
                    handleRemoveService={() => handleRemoveService(index)}
                    handleEditService={() => handleEditService(index, field)}
                    serviceList={field}
                    key={field.id}
                  />
                ))}

              <AddServices handleAddProductFrom={openAddExistingServiceModal} />
              {/* <Divider
                style={{
                  marginTop: 20,
                }}
              /> */}
              <View
                style={{
                  flexDirection: 'column',
                  marginVertical: 20,
                  gap: 10,
                }}>
                <View style={styles.headerContract}>
                  <Icon source="file-document-multiple" size={20} />

                  <Text style={styles.label}>การรับประกัน</Text>
                </View>

                {warranty.productWarrantyMonth > 0 ||
                warranty.skillWarrantyMonth > 0 ? (
                  <Button
                    icon="chevron-right"
                    contentStyle={{
                      flexDirection: 'row-reverse',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => {
                      openContractModal();
                    }}
                    mode="outlined">
                    รายละเอียดการรับประกัน
                  </Button>
                ) : (
                  <View
                    style={{
                      marginBottom: 20,
                    }}>
                    <AddCard
                      buttonName="เพิ่มการรับประกัน"
                      handleAdd={() => {
                        openContractModal();
                      }}
                    />
                  </View>
                )}
              </View>
              <Divider />
              <Summary
                vat7Props={Number(methods.watch('vat7')) === 0 ? false : true}
                taxProps={
                  methods.watch('taxType') !== TaxType.NOTAX
                    ? methods.watch('taxType') === TaxType.TAX3
                      ? 3
                      : 5
                    : 0
                }
                pickerTaxProps={
                  methods.watch('taxType') !== TaxType.NOTAX ? true : false
                }
              />

              <SmallDivider />
              <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>เพิ่มทีมงานติดตั้ง</Text>
                <Switch
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={useWorkers}
                  value={workers.length > 0 ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              {/* workers */}
              {workers.length > 0 && (
                <FlatList
                  data={workers}
                  horizontal={true}
                  contentContainerStyle={styles.contentContainer}
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
                  ListFooterComponent={
                    workers.length > 0 ? (
                      <TouchableOpacity
                        style={styles.addButtonContainer}
                        onPress={() => {
                          openWorkerModal();
                          // navigation.navigate('GalleryScreen', {code});
                        }}>
                        <IconButton
                          icon="plus"
                          size={20}
                          iconColor={'#047e6e'}
                        />
                      </TouchableOpacity>
                    ) : null
                  }
                />
              )}
              <SmallDivider />
              <SignatureSection
                fieldName="sellerSignature"
                title="เพิ่มลายเซ็น"
              />

              <SmallDivider />
              <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>หมายเหตุ</Text>
                <Switch
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() =>
                    setOpenNoteToCustomer(!openNoteToCustomer)
                  }
                  value={openNoteToCustomer ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              {openNoteToCustomer && (
                <View>
                  <Controller
                    control={methods.control}
                    name="noteToCustomer"
                    render={({
                      field: {onChange, onBlur, value},
                      fieldState: {error},
                    }) => (
                      <View>
                        <TextInput
                          keyboardType="default"
                          style={
                            Platform.OS === 'ios'
                              ? {
                                  height: 100,
                                  textAlignVertical: 'top',
                                  marginTop: 10,
                                }
                              : {marginTop: 10}
                          }
                          mode="outlined"
                          numberOfLines={3}
                          multiline={true}
                          textAlignVertical="top"
                          error={!!error}
                          onChangeText={onChange}
                          value={value as string}
                        />
                      </View>
                    )}
                  />
                </View>
              )}
              <SmallDivider />
              <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>โน๊ตภายในบริษัท</Text>
                <Switch
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setOpenNoteToTeam(!openNoteToTeam)}
                  value={openNoteToTeam ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              {openNoteToTeam && (
                <View>
                  <Controller
                    control={methods.control}
                    name="noteToTeam"
                    render={({
                      field: {onChange, onBlur, value},
                      fieldState: {error},
                    }) => (
                      <View>
                        <TextInput
                          keyboardType="default"
                          style={
                            Platform.OS === 'ios'
                              ? {
                                  height: 100,
                                  textAlignVertical: 'top',
                                  marginTop: 10,
                                }
                              : {marginTop: 10}
                          }
                          mode="outlined"
                          numberOfLines={3}
                          multiline={true}
                          textAlignVertical="center"
                          error={!!error}
                          onChangeText={onChange}
                          value={value as string}
                        />
                      </View>
                    )}
                  />
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>
          <Modal
            visible={addCustomerModal}
            animationType="slide"
            style={styles.modalFull}
            onDismiss={() => closeAddCustomerModal()}>
            <AddCustomer onClose={() => closeAddCustomerModal()} />
          </Modal>

          <Modal
            visible={workerModal}
            animationType="slide"
            onDismiss={() => closeWorkerModal()}
            style={styles.modal}>
            <ExistingWorkers
              onClose={() => {
                setWorkerpicker(!workerPicker);
                closeWorkerModal();
              }}
              isVisible={workerModal}
            />
          </Modal>
        </View>

        <SelectProductModal
          onAddService={newProduct => append(newProduct)}
          visible={showAddExistingService}
          onClose={closeAddExistingServiceModal}
        />

        <WarrantyModal visible={contractModal} onClose={closeContractModal} />

        <ProjectModalScreen
          fileName={customer.name}
          visible={showProjectModal}
          onClose={closeProjectModal}
          urlPreview={urlPreview}
          urlShare={urlShare}
        />
        <PDFModalScreen
          fileType="QT"
          fileName={customer.name}
          visible={showPDFModal}
          onClose={closePDFModal}
          pdfUrl={pdfUrl ? pdfUrl : editQuotation?.pdfUrl || ''}
        />
        {/* {showAddNewService && (
          <AddProductFormModal
            resetSelectService={() => setSelectService(null)}
            selectService={selectService}
            resetAddNewService={() => setAddNewService(false)}
            onAddService={newProduct => update(serviceIndex, newProduct)}
            visible={showAddNewService}
            onClose={closeAddNewServiceModal}
          />
        )} */}
        {currentValue && (
          <UpdateServiceModal
            visible={showEditServiceModal}
            resetUpdateService={() => setCurrentValue(null)}
            onClose={closeEditServiceModal}
            currentValue={currentValue}
            serviceIndex={serviceIndex}
            onUpdateService={(
              serviceIndex: number,
              updatedService: IServiceEmbed,
            ) => update(serviceIndex, updatedService)}
          />
        )}
      </FormProvider>
    </>
  );
};

export default CreateQuotation;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const imageContainerWidth = windowWidth / 3 - 10;

const styles = StyleSheet.create({
  container: {
    // backgroundColor:'#f3f8f3',

    // backgroundColor: '#e9f7ff',
    backgroundColor: '#eaf9f9',
  },
  subContainerHead: {
    padding: 30,
    backgroundColor: '#eaf9f9',
    // backgroundColor:'#f3f8f3',
    // backgroundColor: '#e9f7ff',
    height: 'auto',
    flexDirection: 'column',
    gap: 15,
  },
  modalFull: {
    margin: 0,
    marginTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: windowWidth,
    height: windowHeight,
  },
  subContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    marginBottom: 10,
    height: 'auto',
    paddingBottom: 200,
  },
  form: {
    borderColor: '#0073BA',
    borderWidth: 1,
    borderRadius: 10,
  },
  imageContainer: {
    width: imageContainerWidth,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    // bottom: '40%',
    left: 0,
  },
  closeButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit set',
  },
  deleteButtonText: {
    fontSize: 18,
    borderBottomWidth: 1,
    fontWeight: 'bold',
    textDecorationColor: 'red',
    color: 'red',
    borderColor: 'white',
    paddingBottom: 10,
    fontFamily: 'Sukhumvit set',
    paddingTop: 10,
  },

  date: {
    textAlign: 'right',
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
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  workers: {
    flexDirection: 'column',
    marginVertical: 20,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  contentContainer: {
    alignItems: 'center', // Center vertically
    justifyContent: 'center', // Center horizontally
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  closeButton: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignContent: 'center',

    gap: 20,
  },
  textHeader: {
    fontSize: 24,
    fontFamily: 'SukhumvitSet-Bold',
    fontWeight: 'bold',
    color: '#343a40',
  },
  headerContract: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignContent: 'center',
    gap: 20,
  },
  selectButton: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainerForm: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: 80,
  },
  inputSuffix: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  labelWaranty: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 40,
    backgroundColor: '#0073BA',
  },
  signHeader: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 16,
    color: '#19232e',
  },
  summaryTotal: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  pickerAndroidContainer: {
    borderWidth: 0.2,
    borderColor: 'gray',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'white',
    width: 120,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  signText: {
    fontSize: 18,
    marginVertical: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    width: '100%',
  },
  modal: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    height: windowHeight * 0.2,
  },

  headerModal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  containerModal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width: windowWidth,
  },
  modalServiceFull: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: windowWidth,
    height: windowHeight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#19232e',
    alignSelf: 'center',
    fontFamily: 'Sukhumvit set',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  signatureImage: {
    width: '50%',
    aspectRatio: 1,
    borderRadius: 1,
    resizeMode: 'cover',
  },
  addButtonContainer: {
    width: 70,
    margin: 5,
    marginLeft: 20,
    marginBottom: 30,
    textAlign: 'center',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#047e6e',

    // backgroundColor: '#f5f5f5',

    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 50, // Optional, for rounded edges
  },
  containerSegment: {
    flex: 1,
    alignItems: 'center',
  },
});
