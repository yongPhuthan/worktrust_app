import {
  faBriefcase,
  faPlus,
  faSign,
  faSignature,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {yupResolver} from '@hookform/resolvers/yup';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm, useWatch} from 'react-hook-form';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  Appbar,
  Button,
  ProgressBar,
  Switch,
  List,
  Divider,
  IconButton,
  SegmentedButtons,
  Icon,
} from 'react-native-paper';
import {v4 as uuidv4} from 'uuid';
import AddServices from '../../components/AddServices';
import CardClient from '../../components/CardClient';
import CardProject from '../../components/CardProject';
import DocNumber from '../../components/DocNumber';
import Summary from '../../components/Summary';
import AddCustomer from '../../components/add/AddCustomer';
import ContractModal from '../../components/contract/create';
import SelectProductModal from '../../components/service/select';
import DatePickerButton from '../../components/styles/DatePicker';
// import Divider from '../../components/styles/Divider';
import SmallDivider from '../../components/styles/SmallDivider';
import AddCard from '../../components/ui/Button/AddCard';
import SignatureComponent from '../../components/utils/signature';
import ProjectModalScreen from '../../components/webview/project';
import ExistingWorkers from '../../components/workers/existing';
import useCreateQuotation from '../../hooks/quotation/create/useSaveQuotation';
import useSelectedDates from '../../hooks/quotation/create/useSelectDates';
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import {TaxType} from '../../models/Tax';
import {Store} from '../../redux/store';
import {CompanySeller, Service} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import {quotationsValidationSchema} from '../utils/validationSchema';
import PDFModalScreen from '../../components/webview/pdf';
import useShare from '../../hooks/webview/useShare';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'Quotation'>;
}

const Quotation = ({navigation}: Props) => {
  const {
    state: {companySellerState, defaultContract},
    dispatch,
  }: any = useContext(Store);

  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const {initialDocnumber, initialDateOffer, initialDateEnd} =
    useSelectedDates();

  const thaiDateFormatter = useThaiDateFormatter();

  const [workerModal, setWorkerModal] = useState(false);
  // const [customerName, setCustomerName] = useState('');
  const [signaturePicker, setSignaturePicker] = useState(false);
  const [contractPicker, setContractPicker] = useState(false);

  const [workerPicker, setWorkerpicker] = useState(false);

  const [quotationServerId, setQuotationServerId] = useState<string | null>(
    null,
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>('true');
  const [singatureModal, setSignatureModal] = useState(false);
  const [contractModal, setContractModal] = useState(false);
  const [value, setValue] = React.useState('');

  const [signature, setSignature] = useState<string | null>(null);
  const quotationId = uuidv4();
  const [fcmToken, setFtmToken] = useState('');
  const [showAddExistingService, setShowAddExistingService] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const url = `https://www.worktrust.co/preview/${quotationServerId}`;

  const [visibleModalIndex, setVisibleModalIndex] = useState<number | null>(
    null,
  );

  const defalutCustomer = {
    name: '',
    address: '',
    customerTax: '',
    phone: '',
  };

  const initialContract = {
    workCheckEnd: 0,
    workCheckDay: 0,
    installingDay: 0,
    adjustPerDay: 0,
    workAfterGetDeposit: 0,
    prepareDay: 0,
    finishedDay: 0,
    productWarantyYear: 0,
    skillWarantyYear: 0,
    fixDays: 0,
  };

  const quotationDefaultValues = {
    services: [],
    customer: defalutCustomer,
    companySeller: companySellerState,
    vat7: 0,
    taxType: TaxType.NOTAX,
    taxValue: 0,
    summary: 0,
    summaryAfterDiscount: 0,
    discountType: 'PERCENT',
    discountPercentage: 0,
    discountValue: 0,
    allTotal: 0,
    dateOffer: initialDateOffer,
    dateEnd: initialDateEnd,
    docNumber: initialDocnumber,
    workers: [],
    FCMToken: fcmToken,
    sellerSignature: '',
    contract: defaultContract ? defaultContract : initialContract,
  };

  const methods = useForm<any>({
    mode: 'all',
    defaultValues: quotationDefaultValues,
    resolver: yupResolver(quotationsValidationSchema),
  });
  const {fields, append, remove, update} = useFieldArray({
    control: methods.control,
    name: 'services',
  });

  const customer = useWatch({
    control: methods.control,
    name: 'customer',
  });

  const contract = useWatch({
    control: methods.control,
    name: 'contract',
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
  const isCustomerDisabled = useMemo(() => {
    return customer.name === '' && customer.address === '';
  }, [customer.name, customer.address]);

  const isDisabled = !customer.name || services.length === 0;

  useEffect(() => {
    methods.setValue('FCMToken', fcmToken); // Update FCMToken
  }, []);

  const handleShare = useShare({url, title: `ใบเสนอราคา ${customer.name}`});

  const useSignature = () => {
    // Toggle the state of the picker and accordingly set the modal visibility
    setSignaturePicker(prevPickerVisible => {
      const newPickerVisible = !prevPickerVisible;
      setSignatureModal(newPickerVisible);
      if (!newPickerVisible) {
        methods.setValue('sellerSignature', '', {shouldDirty: true});
      }
      return newPickerVisible;
    });
  };

  const useWorkers = () => {
    if (!workerPicker) {
      if (workers.length > 0) {
        setWorkerModal(false);
        setWorkerpicker(!workerPicker);
      } else {
        setWorkerModal(true);
        setWorkerpicker(!workerPicker);
      }
    } else {
      methods.setValue('workers', [], {shouldDirty: true});
      setWorkerpicker(!workerPicker);
    }
  };
  const handleSignatureSuccess = () => {
    setSignatureModal(false);
  };
  const handleModalClose = () => {
    setVisibleModalIndex(null);
  };
  const handleEditService = (index: number, currentValue: Service) => {
    setShowEditServiceModal(!showEditServiceModal);
    handleModalClose();
    navigation.navigate('AddProduct', {
      onAddService: newProduct => update(index, newProduct),
      currentValue,
      quotationId: quotationId,
    });
    // navigation.navigate('EditProductForm', {index, currentValue, update});
  };

  const actions: any = {
    setQuotationServerId,
    setPdfUrl,
    setShowProjectModal,
  };

  const {mutate, isPending} = useCreateQuotation(actions);

  const handleButtonPress = async () => {
    await mutate(methods.getValues());
  };

  const handleInvoiceNumberChange = (text: string) => {
    methods.setValue('docNumber', text);
  };

  const handleStartDateSelected = (date: Date) => {
    const formattedDate = thaiDateFormatter(date);
    methods.setValue('dateOffer', formattedDate);
  };
  const handleEndDateSelected = (date: Date) => {
    const formattedEndDate = thaiDateFormatter(date);
    methods.setValue('dateEnd', formattedEndDate);
  };

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);
    remove(index);
  };

  const onCloseSignature = () => {
    setSignaturePicker(false);
    setSignatureModal(false);
    methods.setValue('sellerSignature', '', {shouldDirty: true});
  };
  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction
          onPress={() => {
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
          }}
        />
        <Appbar.Content
          title="สร้างใบเสนอราคา"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}
        />
        <Button
          loading={isPending}
          disabled={isDisabled}
          testID="submited-button"
          mode="contained"
          onPress={handleButtonPress}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      {/* <ProgressBar progress={0.5} /> */}

      <FormProvider {...methods}>
        <View style={{flex: 1}}>
          <ScrollView style={styles.container}>
            <View style={styles.subContainerHead}>
              <DatePickerButton
                label="วันที่เสนอราคา"
                title="วันที่เสนอราคา"
                date="today"
                onDateSelected={handleStartDateSelected}
              />
              <DocNumber
                label="เลขที่เอกสาร"
                onChange={handleInvoiceNumberChange}
                value={methods.watch('docNumber')}
              />
              <DatePickerButton
                label="ยืนราคาถึงวันที่ี"
                title="ยืนราคาถึงวันที่ี"
                date="sevenDaysFromNow"
                onDateSelected={handleEndDateSelected}
              />
            </View>
            <View style={styles.subContainer}>
              <View style={{marginVertical: 20}}>
                {!isCustomerDisabled ? (
                  <CardClient
                    handleEditClient={() => setAddCustomerModal(true)}
                  />
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
                      handleAdd={() => setAddCustomerModal(true)}
                    />
                  </>
                )}
              </View>
              <View style={styles.header}>
                <FontAwesomeIcon icon={faBriefcase} color="#19232e" size={18} />

                <Text style={styles.label}>บริการ-สินค้า</Text>
              </View>
              {fields.length > 0 &&
                fields.map((field: any, index: number) => (
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

              <AddServices
                handleAddProductFrom={() => setShowAddExistingService(true)}
              />
              <Divider
                style={{
                  marginTop: 20,
                }}
              />
              <View
                style={{
                  flexDirection: 'column',
                  marginVertical: 20,
                  gap: 10,
                }}>
                <View style={styles.headerContract}>
                  <Icon source="file-document-multiple" size={20} />

                  <Text style={styles.label}>สัญญา</Text>
                </View>

                {contract ? (
                  <Button
                    onPress={() => {
                      setContractModal(true);
                    }}
                    // icon={'visible'}
                    children="ดูสัญญา"
                    mode="outlined"
                  />
                ) : (
                  <View
                    style={{
                      marginBottom: 20,
                    }}>
                    <AddCard
                      buttonName="เพิ่มสัญญา"
                      handleAdd={() => {
                        setContractModal(true);
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
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={workerPicker ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => useWorkers()}
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
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}>
                  <FlatList
                    data={workers}
                    horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <View style={styles.imageContainer}>
                          <TouchableOpacity
                            onPress={() => setWorkerModal(true)}>
                            <Image
                              source={{uri: item.image}}
                              style={styles.image}
                            />
                            <Text>{item.name}</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={
                      workers.length > 0 ? (
                        <TouchableOpacity
                          style={styles.addButtonContainer}
                          onPress={() => {
                            setWorkerModal(true);
                            // navigation.navigate('GalleryScreen', {code});
                          }}>
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={32}
                            color="#0073BA"
                          />
                        </TouchableOpacity>
                      ) : null
                    }
                  />
                </View>
              )}
              <SmallDivider />
              <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>เพิ่มลายเซ็น</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={signaturePicker ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={useSignature}
                  value={signaturePicker}
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
                <View>
                  <Image
                    source={{uri: sellerSignature}}
                    style={styles.signatureImage}
                  />
                </View>
              )}
            </View>
          </ScrollView>
          <Modal
            isVisible={addCustomerModal}
            style={styles.modalFull}
            onBackdropPress={() => setAddCustomerModal(false)}>
            <AddCustomer onClose={() => setAddCustomerModal(false)} />
          </Modal>

          <Modal
            isVisible={workerModal}
            onBackdropPress={() => setWorkerModal(false)}
            style={styles.modal}>
            <ExistingWorkers
              onClose={() => {
                setWorkerpicker(!workerPicker);
                setWorkerModal(false);
              }}
              isVisible={workerModal}
            />
          </Modal>
        </View>
        <Modal
          isVisible={singatureModal}
          style={styles.modal}
          onBackdropPress={onCloseSignature}>
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
              onClose={() => setSignatureModal(false)}
              setSignatureUrl={setSignature}
              onSignatureSuccess={handleSignatureSuccess}
            />
          </SafeAreaView>
        </Modal>
        <SelectProductModal
          quotationId={quotationId}
          onAddService={newProduct => append(newProduct)}
          currentValue={null}
          visible={showAddExistingService}
          onClose={() => setShowAddExistingService(false)}
        />
        <ContractModal
          visible={contractModal}
          onClose={() => setContractModal(false)}
        />

        {quotationServerId && pdfUrl && (
          <>
            <ProjectModalScreen
              fileName={customer.name}
              visible={showProjectModal}
              onClose={() => setShowProjectModal(false)}
              quotationId={quotationServerId}
              pdfUrl={pdfUrl}
            />
            <PDFModalScreen
              fileName={customer.name}
              visible={showPDFModal}
              onClose={() => setShowPDFModal(false)}
              pdfUrl={pdfUrl}
            />

            <SegmentedButtons
              style={{
                margin: 10,
                marginHorizontal: 20,
              }}
              value={value}
              onValueChange={setValue}
              buttons={[
                {
                  value: 'preview',
                  label: 'พรีวิว',
                  icon: 'eye',
                  onPress: () => setShowProjectModal(true),
                },
                {
                  value: 'train',
                  label: 'สัญญา',
                  icon: 'file-document',
                  onPress: () => setShowPDFModal(true),
                },
                {
                  value: 'train',
                  label: 'แชร์',
                  icon: 'share-variant',
                  onPress: handleShare,
                },
              ]}
            />
          </>
        )}
      </FormProvider>
    </>
  );
};

export default Quotation;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const imageContainerWidth = windowWidth / 3 - 10;

const styles = StyleSheet.create({
  container: {
    // backgroundColor:'#f3f8f3',

    backgroundColor: '#e9f7ff',
  },
  subContainerHead: {
    padding: 30,
    // backgroundColor:'#f3f8f3',
    backgroundColor: '#e9f7ff',
    height: 'auto',
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
