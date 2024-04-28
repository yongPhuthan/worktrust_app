import React, {useContext, useMemo, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Alert,
  View,
} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Appbar, Button, ProgressBar} from 'react-native-paper';
import useSelectedDates from '../../../hooks/quotation/create/useSelectDates';
import {v4 as uuidv4} from 'uuid';
import {BACK_END_SERVER_URL} from '@env';
import {faBriefcase, faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {yupResolver} from '@hookform/resolvers/yup';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FormProvider, useFieldArray, useForm, useWatch} from 'react-hook-form';
import Modal from 'react-native-modal';
import AddClient from '../../../components/AddClient';
import AddServices from '../../../components/AddServices';
import CardClient from '../../../components/CardClient';
import CardProject from '../../../components/CardProject';
import DocNumber from '../../../components/DocNumber';
import Summary from '../../../components/Summary';
import AddCustomer from '../../../components/add/AddCustomer';
import DatePickerButton from '../../../components/styles/DatePicker';
import Divider from '../../../components/styles/Divider';
import SmallDivider from '../../../components/styles/SmallDivider';
import SignatureComponent from '../../../components/utils/signature';
import useThaiDateFormatter from '../../../hooks/utils/useThaiDateFormatter';
import {Store} from '../../../redux/store';
import {Service} from '../../../types/docType';
import {ParamListBase} from '../../../types/navigationType';
import {TaxType} from '../../../models/Tax';
import ExistingWorkers from '../../../components/workers/existing';
import {
  invoiceValidationSchema,
  quotationsValidationSchema,
} from '../../utils/validationSchema';
import useCreateInvoice from '../../../hooks/invoice/useCreateInvoice';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'CreateByQuotationScreen'>;
  route: RouteProp<ParamListBase, 'CreateByQuotation'>;
}
interface MyError {
  response: object;
}

const CreateByQuotation = ({navigation, route}: Props) => {
  const {dispatch}: any = useContext(Store);
  const companyUser = route.params.company;
  const quotation = route.params.quotation;
  const servicesParams = route.params.services;
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState(false);
  const thaiDateFormatter = useThaiDateFormatter();
  const [editServicesModal, setEditServicesModal] = useState(false);
  const [workerModal, setWorkerModal] = useState(false);
  const [workerPicker, setWorkerpicker] = useState(false);
  const [singatureModal, setSignatureModal] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState(0);
  const {initialDocnumber, initialDateOffer, initialDateEnd} =
    useSelectedDates();
  const invoiceId = uuidv4();
  const backendUrl = `${BACK_END_SERVER_URL}/api/documents/createInvoice`;
  const [createInvoice, {loading, error, data}] = useCreateInvoice(backendUrl);
  const queryClient = useQueryClient();

  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [visibleModalIndex, setVisibleModalIndex] = useState<number | null>(
    null,
  );
  const invoiceDefaultValues = {
    services: servicesParams,
    customer: quotation.customer,
    companyUser,
    vat7: quotation.vat7 ? quotation.vat7 : 0,
    taxType: quotation.taxType ? quotation.taxType : TaxType.NOTAX,
    taxValue: quotation.taxValue ? quotation.taxValue : 0,
    summary: quotation.summary,
    summaryAfterDiscount: quotation.summaryAfterDiscount,
    discountType: quotation.discountType,
    discountPercentage: quotation.discountPercentage,
    discountValue: quotation.discountValue,
    allTotal: quotation.allTotal,
    dateOffer: quotation.dateOffer,
    dateEnd: quotation.dateEnd,
    docNumber:   initialDocnumber,
    sellerSignature: quotation.sellerSignature,
    quotationNumber: quotation.docNumber,
    quotationRef: quotation.id,
  };

  const methods = useForm<any>({
    mode: 'all',
    defaultValues: invoiceDefaultValues,
    resolver: yupResolver(invoiceValidationSchema),
  });
  const {fields, append, remove, update} = useFieldArray({
    control: methods.control,
    name: 'services',
  });

  const customer = useWatch({
    control: methods.control,
    name: 'customer',
  });

  const sellerSignature = useWatch({
    control: methods.control,
    name: 'sellerSignature',
  });

  const services = useWatch({
    control: methods.control,
    name: 'services',
  });

  const isCustomerDisabled = useMemo(() => {
    return customer.name === '' && customer.address === '';
  }, [customer.name, customer.address]);

  const isDisabled = !customer.name || services.length === 0;
  const [pickerVisible, setPickerVisible] = useState(
    sellerSignature !== '' ? true : false,
  );

  const useSignature = () => {
    // Toggle the state of the picker and accordingly set the modal visibility
    setPickerVisible(prevPickerVisible => {
      const newPickerVisible = !prevPickerVisible;
      setSignatureModal(newPickerVisible);
      if (!newPickerVisible) {
        methods.setValue('sellerSignature', '', {shouldDirty: true});
      } else {
        methods.setValue('sellerSignature', signature, {shouldDirty: true});
      }
      return newPickerVisible;
    });
  };
  const onCloseSignature = () => {
    setPickerVisible(false);
    setSignatureModal(false);
    methods.setValue('sellerSignature', '', {shouldDirty: true});
  };
  const handleSignatureSuccess = () => {
    setSignatureModal(false);
  };
  const handleModalClose = () => {
    setVisibleModalIndex(null);
  };
  const handleAddProductForm = async () => {
    if (companyUser) {
      navigation.navigate('AddProduct', {
        onAddService: newProduct => append(newProduct),
        quotationId: quotation.id,
        currentValue: null,
      });
      // navigation.navigate('ExistingProduct', {id: companyUser.user?.id});
    } else {
      console.log('companyUser', companyUser);
      // await firebase.auth().signOut();
    }
  };
  const handleEditService = (index: number, currentValue: Service) => {
    setShowEditServiceModal(!showEditServiceModal);
    handleModalClose();
    navigation.navigate('AddProduct', {
      onAddService: newProduct => update(index, newProduct),
      currentValue,
      quotationId: invoiceId,
    });
    // navigation.navigate('EditProductForm', {index, currentValue, update});
  };
  const handleButtonPress = async () => {
    const currentValues = methods.getValues();

    try {
      await createInvoice(currentValues);
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ['dashboardQuotation', companyUser?.user?.email],
        });
        navigation.navigate('DocViewScreen', {id: data.invoiceId});
      }
      if (error) {
        Alert.alert(
          'เกิดข้อผิดพลาด',
          `Server-side user creation failed:, ${error}`,
          [{text: 'OK'}],

          {cancelable: false},
        );
      }
    } catch (error) {
      console.error('There was a problem calling the function:', error);
      throw new Error(error as any);
    }
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
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title="สร้างใบวางบิล"
          titleStyle={{fontSize: 18, fontWeight: 'bold'}}
        />
        <Button
          loading={loading}
          disabled={isDisabled}
          mode="contained"
          onPress={handleButtonPress}>
          {'ไปต่อ'}
        </Button>
      </Appbar.Header>
      <ProgressBar progress={0.5}  />
      <FormProvider {...methods}>
        <View style={{flex: 1}}>
          <ScrollView style={styles.container}>
            <View style={styles.subContainerHead}>
              <DatePickerButton
                title="วันที่วางบิล"
                label="วันที่วางบิล"
                date="today"
                onDateSelected={handleStartDateSelected}
              />
              <DocNumber
                label="เลขที่เอกสาร"
                onChange={handleInvoiceNumberChange}
                value={methods.watch('docNumber')}
              />
              <DatePickerButton
                title="วันที่สินสุด"
                label="วันที่สิ้นสุด"
                date="sevenDaysFromNow"
                onDateSelected={handleEndDateSelected}
              />
            </View>
            <View style={styles.subContainer}>
              {!isCustomerDisabled ? (
                <CardClient
                  handleEditClient={() => setAddCustomerModal(true)}
                />
              ) : (
                <AddClient handleAddClient={() => setAddCustomerModal(true)} />
              )}

              <View style={styles.header}>
                <FontAwesomeIcon icon={faBriefcase} color="#19232e" size={20} />
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

              <AddServices handleAddProductFrom={handleAddProductForm} />
              <Divider />

              {/* <Divider /> */}
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
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => useSignature()}
                  value={pickerVisible ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
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
          {/* <View>
          <FooterBtn
            btnText="ดำเนินการต่อ"
            disabled={isDisabled}
            onPress={handleButtonPress}
          />
        </View> */}
        </View>
      </FormProvider>
    </>
  );
};

export default CreateByQuotation;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const imageContainerWidth = windowWidth / 3 - 10;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e9f7ff',
  },
  subContainerHead: {
    padding: 30,
    marginBottom: 10,
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
    padding: 30,
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
    marginTop: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 20,
    paddingVertical: 5,
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
});
