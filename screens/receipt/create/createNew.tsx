import {faBriefcase, faUser} from '@fortawesome/free-solid-svg-icons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {yupResolver} from '@hookform/resolvers/yup';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useMemo, useState} from 'react';
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
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Divider,
  IconButton,
  SegmentedButtons,
  Switch,
  TextInput,
} from 'react-native-paper';
import {v4 as uuidv4} from 'uuid';
import AddServices from '../../../components/AddServices';
import CardClient from '../../../components/CardClient';
import CardProject from '../../../components/CardProject';
import DocNumber from '../../../components/DocNumber';
import Summary from '../../../components/Summary';
import AddCustomer from '../../../components/add/AddCustomer';
import SelectProductModal from '../../../components/service/select';
import DatePickerButton from '../../../components/styles/DatePicker';
// import Divider from '../../components/styles/Divider';
import AddProductFormModal from '../../../components/service/addNew';
import SmallDivider from '../../../components/styles/SmallDivider';
import AddCard from '../../../components/ui/Button/AddCard';
import SignatureComponent from '../../../components/utils/signature/create';
import PDFModalScreen from '../../../components/webview/pdf';
import ExistingWorkers from '../../../components/workers/existing';
import {useModal} from '../../../hooks/quotation/create/useModal';
import useSelectedDates from '../../../hooks/quotation/create/useSelectDates';
import useCreateNewReceipt from '../../../hooks/receipt/useCreateReceipt';
import useThaiDateFormatter from '../../../hooks/utils/useThaiDateFormatter';
import {TaxType} from '../../../models/Tax';
import * as stateAction from '../../../redux/actions';
import {Store} from '../../../redux/store';
import {ParamListBase} from '../../../types/navigationType';
import UpdateServiceModal from '../../../components/service/update';
import {
  CustomerEmbed,
  DiscountType,
  Quotations,
  ReceiptStatus,
  Receipts,
  ServicesEmbed,
} from '@prisma/client';
import {CompanyState} from 'types';
import ShowSignature from '../../../components/utils/signature/view';
import useUpdateReceipt from '../../../hooks/receipt/update/useUpdateReceipt';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'CreateNewReceipt'>;
}

const CreateNewReceipt = ({navigation}: Props) => {
  const {
    state: {
      companyState,
      sellerId,
      editReceipt,
      defaultWarranty,
      quotationRefNumber,
      editQuotation,
      quotationId,
    },
    dispatch,
  } = useContext(Store);

  const {
    initialDocnumber,
    initialDateOfferFormatted,
    initialDateEndFormatted,
    initialDateEnd,
    initialDateOffer,
  } = useSelectedDates();

  const thaiDateFormatter = useThaiDateFormatter();
  const [addNewService, setAddNewService] = useState(false);

  // const [customerName, setCustomerName] = useState('');
  const [signaturePicker, setSignaturePicker] = useState(false);
  const [save, setSave] = useState<boolean>(false);

  const [isLoadingWebP, setIsLoadingWebP] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [value, setValue] = React.useState('');
  const [isNewReceipt, setIsNewReceipt] = useState(editReceipt ? false : true);

  const [openNoteToCustomer, setOpenNoteToCustomer] = useState(false);
  const [openNoteToTeam, setOpenNoteToTeam] = useState(false);
  const [selectService, setSelectService] = useState<ServicesEmbed | null>(
    null,
  );
  const [currentValue, setCurrentValue] = useState<ServicesEmbed | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const [dateOfferFormatted, setDateOfferFormatted] = useState<string>(
    initialDateOfferFormatted,
  );
  const [dateEndFormatted, setDateEndFormatted] = useState<string>(
    initialDateEndFormatted,
  );
  const [serviceIndex, setServiceIndex] = useState<number>(0);
  const [fcmToken, setFtmToken] = useState('');
  const [receiptServerId, setReceiptServerId] = useState<string | null>(
    editReceipt ? editReceipt.id : null,
  );
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
    openModal: openAddNewServiceModal,
    closeModal: closeAddNewServiceModal,
    isVisible: showAddNewService,
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

  const defalutCustomer: CustomerEmbed = {
    id: uuidv4(),
    name: '',
    address: '',
    customerTax: '',
    phone: '',
  };
  const receiptDefaultValue: Receipts = {
    id: uuidv4(),
    services: [],
    customer: defalutCustomer,
    companyId: companyState ? companyState.id : '',
    quotationRefNumber: quotationRefNumber ? quotationRefNumber : '',
    vat7: 0,
    taxType: TaxType.NOTAX,
    taxValue: 0,
    summary: 0,
    summaryAfterDiscount: 0,
    paymentMethod: '',
    paymentStatus: '',
    depositPaid: false,
    depositApplied: 0,
    sellerId,
    discountType: DiscountType.PERCENT,
    FCMToken: '',
    discountPercentage: 0,
    discountValue: 0,
    allTotal: 0,
    netAmount: 0,
    remaining: 0,
    dateOffer: initialDateOffer,
    noteToCustomer: '',
    noteToTeam: '',
    docNumber: `IV${initialDocnumber}`,
    sellerSignature: '',
    status: ReceiptStatus.PENDING, // Set the status to a valid QuotationStatus value
    dateApproved: null,
    pdfUrl: null,
    updated: new Date(),
    created: new Date(),

    customerSign: null,
  };
  const methods = useForm<Receipts | Quotations>({
    mode: 'all',
    defaultValues: editReceipt ? editReceipt : editQuotation ? editQuotation : receiptDefaultValue ,
  });
  const {fields, append, remove, update} = useFieldArray({
    control: methods.control,
    name: 'services',
  });

  const customer = useWatch({
    control: methods.control,
    name: 'customer',
  });
  const services = useWatch({
    control: methods.control,
    name: 'services',
  });
  const sellerSignature = useWatch({
    control: methods.control,
    name: 'sellerSignature',
  });

  const isCustomerDisabled = useMemo(() => {
    return customer.name === '' && customer.address === '';
  }, [customer.name, customer.address]);

  const isDisabled = !customer.name || services.length === 0;
  useEffect(() => {
    methods.setValue('FCMToken', fcmToken);
  }, [dateEndFormatted, dateOfferFormatted, fcmToken, methods]);

  const useSignature = () => {
    if (sellerSignature) {
      methods.setValue('sellerSignature', '', {shouldDirty: true});
      onCloseSignature();
    } else {
      openSignatureModal();
    }
  };

  const handleModalClose = () => {
    setVisibleModalIndex(null);
  };
  const handleEditService = (index: number, currentValue: ServicesEmbed) => {
    openEditServiceModal();
    handleModalClose();
    setCurrentValue(currentValue);
    openAddNewServiceModal();
    setServiceIndex(index);
  };

  const actions: any = {
    setPdfUrl,
    openPDFModal,
    setReceiptServerId,
  };


  const {mutate, isPending} = useCreateNewReceipt(actions);
  const {mutate: updateReceipt, isUpdating: isUpdatePending} =
    useUpdateReceipt(actions);
  const handleButtonPress = async () => {
    const data = {
      receipt: methods.getValues() as Receipts,
      company: companyState as CompanyState,
      quotationId,
    };
    if (isNewReceipt) {
      mutate(data, {
        onSuccess: response => {
          setIsNewReceipt(false);
        },
      });
    } else {
      const existingData = {
        ...methods.getValues(),
        id: receiptServerId,
      };
      const data = {
        receipt: existingData as Receipts,
        company: companyState as CompanyState,
        quotationId,
      };
      updateReceipt(data);
      setSave(true);
    }
    setSave(true);
  };
  // const handleButtonPress = async () => {
  //   const data = {
  //     receipt: methods.getValues() as Receipts, // Add the missing 'invoice' property
  //     company: companyState as CompanyState,
  //     quotationId,

  //   };
  //   mutate(data);
  //   setSave(true)
  // };

  const handleInvoiceNumberChange = (text: string) => {
    methods.setValue('docNumber', text);
  };

  const handleQuotationRefNumberChange = (text: string) => {
    methods.setValue('quotationRefNumber', text);
  };

  const handleStartDateSelected = (date: Date) => {
    setDateOfferFormatted(thaiDateFormatter(date));
    methods.setValue('dateOffer', date);
  };

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);
    remove(index);
  };

  const onCloseSignature = () => {
    setSignaturePicker(false);
    closeSignatureModal();
    // methods.setValue('sellerSignature', '', {shouldDirty: true});
  };
  useEffect(() => {
    if (!openNoteToCustomer || !openNoteToTeam) {
      methods.setValue('noteToCustomer', '', {shouldDirty: true});
      methods.setValue('noteToTeam', '', {shouldDirty: true});
    }
    if (editReceipt) {
      methods.setValue(
        'quotationRefNumber',
        editReceipt.quotationRefNumber
          ? editReceipt.quotationRefNumber
          : quotationRefNumber,
      );
      methods.setValue('docNumber', `IV${initialDocnumber}`);
    }
  }, [openNoteToCustomer, openNoteToTeam]);
  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="" />
        <Appbar.Action    disabled={editReceipt ? !editReceipt.pdfUrl : !pdfUrl}  iconColor='#047e6e'  mode='outlined'      icon="file-document"onPress={openPDFModal} />
        <Appbar.Content title="" />
        <Button
          loading={isPending || isUpdatePending}
          disabled={isDisabled || isUpdatePending}
          testID="submited-button"
          mode="contained"
          onPress={handleButtonPress}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <FormProvider {...methods}>
        <View style={{flex: 1}}>
          <KeyboardAwareScrollView style={styles.container}>
            <View style={styles.subContainerHead}>
              <Text style={styles.textHeader}>ใบเสร็จรับเงิน</Text>

              <DatePickerButton
                label="วันที่"
                title="วันที่"
                date={new Date(methods.watch('dateOffer'))}
                onDateSelected={handleStartDateSelected}
              />
              <DocNumber
                label="เลขที่เอกสาร"
                onChange={handleInvoiceNumberChange}
                value={methods.watch('docNumber')}
              />
              <DocNumber
                label="อ้างอิง"
                onChange={handleQuotationRefNumberChange}
                value={methods.watch('quotationRefNumber') || ''}
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
                fields.map((field, index: number) => (
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
              <Divider
                style={{
                  marginTop: 20,
                }}
              />

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
                <Text style={styles.signHeader}>เพิ่มลายเซ็น</Text>
                <Switch
                  trackColor={{false: '#a5d6c1', true: '#4caf82'}}
                  thumbColor={sellerSignature ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={useSignature}
                  value={sellerSignature ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              {sellerSignature && (
                <ShowSignature
                  sellerSignature={sellerSignature}
                  isLoadingWebP={isLoadingWebP}
                  setIsLoadingWebP={setIsLoadingWebP}
                />
              )}
              <SmallDivider />
              <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>หมายเหตุ</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={openNoteToCustomer ? '#ffffff' : '#f4f3f4'}
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
                          keyboardType="name-phone-pad"
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
                          value={value ?? ''}
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
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={openNoteToTeam ? '#ffffff' : '#f4f3f4'}
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
                          keyboardType="name-phone-pad"
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
                          value={value ?? ''}
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
            onDismiss={closeAddCustomerModal}>
            <AddCustomer onClose={() => closeAddCustomerModal()} />
          </Modal>
        </View>
        <Modal
          visible={signatureModal}
          animationType="slide"
          style={styles.modal}
          onDismiss={onCloseSignature}>
          <Appbar.Header
            mode="center-aligned"
            style={{
              backgroundColor: 'white',
              width: Dimensions.get('window').width,
            }}>
            <Appbar.Action icon={'close'} onPress={onCloseSignature} />
            <Appbar.Content
              title="ลายเซ็นผู้เสนอราคา"
              titleStyle={{fontSize: 18, fontWeight: 'bold'}}
            />
          </Appbar.Header>
          <SafeAreaView style={styles.containerModal}>
            <SignatureComponent
              setLoadingWebP={setIsLoadingWebP}
              onClose={closeSignatureModal}
              setSignatureUrl={setSignature}
              onSignatureSuccess={closeSignatureModal}
            />
          </SafeAreaView>
        </Modal>
        <SelectProductModal
          onAddService={newProduct => append(newProduct)}
          visible={showAddExistingService}
          onClose={closeAddExistingServiceModal}
        />
      <PDFModalScreen
                fileType="IV"
                fileName={customer.name}
                visible={showPDFModal}
                onClose={closePDFModal}
                pdfUrl={
                  editReceipt
                    ? editReceipt.pdfUrl
                      ? editReceipt.pdfUrl
                      : ''
                    : pdfUrl || ''
                }
              />
      
        {currentValue && (
          <UpdateServiceModal
            visible={showEditServiceModal}
            resetUpdateService={() => setCurrentValue(null)}
            onClose={closeEditServiceModal}
            currentValue={currentValue}
            serviceIndex={serviceIndex}
            onUpdateService={(serviceIndex :number,updatedService : ServicesEmbed ) => update( serviceIndex,updatedService)}
          />
        )}
      </FormProvider>
    </>
  );
};

export default CreateNewReceipt;
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
    // backgroundColor:'#f3f8f3',
    // backgroundColor: '#e9f7ff',
    backgroundColor: '#eaf9f9',

    height: 'auto',
    flexDirection: 'column',
    gap: 10,
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
  textHeader: {
    fontSize: 24,
    fontFamily: 'SukhumvitSet-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343a40',
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
  icon: {
    width: 24,
    height: 24,
    marginRight: 15,
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
    width: 100,
    margin: 5,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0073BA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
  containerSegment: {
    flex: 1,
    alignItems: 'center',
  },
});
