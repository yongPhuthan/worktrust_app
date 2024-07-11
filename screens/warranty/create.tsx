import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useContext, useState} from 'react';
import {Resolver, useForm, useWatch, FormProvider} from 'react-hook-form';
import * as yup from 'yup';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  Modal,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Appbar,
  Button,
  Divider,
  IconButton,
  Switch,
  TextInput,
  Text as TextPaper,
} from 'react-native-paper';
import {quotationsValidationSchema} from '../../models/validationSchema';
import * as stateAction from '../../redux/actions';
import {v4 as uuidv4} from 'uuid';
import DatePickerButton from '../../components/styles/DatePicker';
import {useModal} from '../../hooks/quotation/create/useModal';
import useSelectedDates from '../../hooks/quotation/create/useSelectDates';
import useCreateSubmission from '../../hooks/submission/useCreate';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import {ParamListBase} from '../../types/navigationType';
import {Quotations} from '@prisma/client';
import useCreateWarrantyPDF from '../../hooks/warranty/useCreateWarranty';
import PDFModalScreen from '../../components/webview/pdf';
import {CompanyState} from 'types';
import ShowSignature from '../../components/utils/signature/view';
import SignatureComponent from '../../components/utils/signature/create';
import SignatureModal from '../../components/utils/signature/select';
type Props = {
  navigation: StackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, 'CreateWarranty'>;
};

const CreateWarranty = (props: Props) => {
  const {route, navigation} = props;
  const {
    initialDocnumber,
    initialDateOfferFormatted,
    initialDateEndFormatted,
    initialDateEnd,
    initialDateOffer,
  } = useSelectedDates();
  const {
    openModal: openSignatureModal,
    closeModal: closeSignatureModal,
    isVisible: signatureModal,
  } = useModal();
  const {
    state: {code, editQuotation, G_company, defaultWarranty},
    dispatch,
  } = useContext(Store);

  if (!editQuotation || !G_company || !editQuotation.customer) {
    Alert.alert('ไม่พบข้อมูลใบเสนอราคา');
    navigation.goBack();
    return null;
  }
  const {
    openModal: openPDFModal,
    closeModal: closePDFModal,
    isVisible: showPDFModal,
  } = useModal();
  const [dateOfferFormatted, setDateOfferFormatted] = useState<string>(
    initialDateOfferFormatted,
  );
  const queryClient = useQueryClient();
  const user = useUser();
  const [copied, setCopied] = useState(false);
  const imageRandomId = uuidv4();
  const [isLoadingWebP, setIsLoadingWebP] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(
    editQuotation.warranty.pdfUrl ? editQuotation.warranty.pdfUrl : null,
  );
  const [submissionId, setSubmissionId] = useState<string>('');
  const [submissionServerId, setSubmissionServerId] = useState<string | null>(
    null,
  );
  const [selectedSignature, setSelectedSignature] = useState<string | null>(
    null,
  );

  function safeToString(value: string | number | null | undefined) {
    return value !== undefined && value !== null ? value.toString() : '';
  }
  const actions: any = {
    setPdfUrl,
    openPDFModal,
  };

  const resolver: Resolver<Quotations> = async values => {
    try {
      const validatedValues = await quotationsValidationSchema.validate(
        values,
        {
          abortEarly: false,
        },
      );
      return {
        values: validatedValues,
        errors: {},
      };
    } catch (err) {
      const validationErrors = err as yup.ValidationError;

      return {
        values: {},
        errors: validationErrors.inner.reduce((allErrors, currentError) => {
          if (currentError.path) {
            allErrors[currentError.path] = {
              type: currentError.type ?? 'validation',
              message: currentError.message,
            };
          }
          return allErrors;
        }, {} as Record<string, {type: string; message: string}>),
      };
    }
  };

  const methods = useForm<Quotations>({
    mode: 'all',
    defaultValues: editQuotation,
    resolver,
  });

  const dateWarranty = methods.watch('warranty.dateWaranty');

  const {mutate, isPending} = useCreateWarrantyPDF(actions);

  const handleStartDateSelected = (date: Date) => {
    methods.setValue('warranty.dateWaranty', date, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  const handleButtonPress = async () => {
    const data = {
      quotation: methods.getValues() as Quotations,
      company: G_company as CompanyState,
    };
    console.log('data', data);
    mutate(data);
  };
  const sellerSignature = useWatch({
    control: methods.control,
    name: 'warranty.sellerSignature',
  });
  const onCloseSignature = () => {
    closeSignatureModal();
  };
  const useSignature = () => {
    if (sellerSignature) {
      methods.setValue('warranty.sellerSignature', '', {shouldDirty: true});
      setSelectedSignature(null);
      onCloseSignature();
    } else {
      openSignatureModal();
    }
  };
  const renderWanranty = (
    label: string,
    defaultValue: string = '',
    textAffix: string,
  ) => (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',

          marginTop: 10,
        }}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 20,
            width: width * 0.2,
          }}>
          <TextPaper variant="bodyLarge"> {defaultValue}</TextPaper>
          <TextPaper variant="bodyLarge">{textAffix}</TextPaper>
        </View>
      </View>
    </>
  );
  React.useEffect(() => {
    if (!dateWarranty) {
      methods.setValue('warranty.dateWaranty', new Date(), {shouldDirty: true});
    }
  }, [dateWarranty]);
  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (sellerSignature && isLoadingWebP) {
        try {
          const response = await fetch(sellerSignature);
          if (response.ok) {
            setIsLoadingWebP(false);
          }
        } catch (error) {
          console.error('Error checking SignatureImage:', error);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [sellerSignature, isLoadingWebP]);
  React.useEffect(() => {
    if (selectedSignature) {
      methods.setValue('warranty.sellerSignature', selectedSignature, {
        shouldDirty: true,
      });
    }
  }, [selectedSignature]);
  return (
    <FormProvider {...methods}>
      <Appbar.Header
        style={{
          backgroundColor: 'white',
        }}
        elevated
        mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            dispatch(stateAction.reset_edit_quotation());
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title=""
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
          }}
        />
        <IconButton
          disabled={isPending || !pdfUrl}
          mode="outlined"
          icon="file-document"
          iconColor="gray"
          onPress={openPDFModal}
        />
        <Appbar.Content
          title=""
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
          }}
        />
        <Button
          mode="contained"
          loading={isPending}
          disabled={isPending}
          onPress={handleButtonPress}
          style={{marginRight: 5}}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>

      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: 200,
          margin: 10,
          marginHorizontal: 20,
        }}>
        {editQuotation.warranty && dateWarranty ? (
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">ใบรับประกัน</TextPaper>
              <Divider style={{marginTop: 10}} />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text style={styles.signHeader}>ลูกค้า</Text>
                <View style={{marginTop: 10, marginLeft: 10}}>
                  <TextPaper>{editQuotation.customer.name}</TextPaper>
                </View>
              </View>
              <DatePickerButton
                title="วันที่เริ่มประกัน"
                label="วันที่เริ่มประกัน"
                date={new Date(dateWarranty)}
                onDateSelected={handleStartDateSelected}
              />

              <View style={styles.formInput}>
                {renderWanranty(
                  'รับประกันวัสดุอุปกรณ์',
                  safeToString(editQuotation.warranty.skillWarrantyMonth),
                  'เดือน',
                )}
                {renderWanranty(
                  'รับประกันงานติดตั้ง',
                  safeToString(editQuotation.warranty.skillWarrantyMonth),
                  'เดือน',
                )}
                {renderWanranty(
                  'เมื่อมีปัญหาจะแก้ไขงานให้แล้วเสร็จภายใน',
                  safeToString(editQuotation.warranty.fixDays),
                  'วัน',
                )}
              </View>
            </View>
            <Divider style={{marginVertical: 10}} />
            <View style={styles.signatureRow}>
              <Text style={styles.signHeader}>เพิ่มลายเซ็น</Text>
              <Switch
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
            <Divider style={{marginVertical: 10}} />

            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">
                เงื่อนไข-ข้อยกเว้นในการรับประกัน
              </TextPaper>
              <Divider style={{marginVertical: 10}} />
              <View style={styles.formCondition}>
                <TextPaper variant="bodyLarge">
                  {editQuotation.warranty.condition}
                </TextPaper>
              </View>
            </View>
          </SafeAreaView>
        ) : (
          <TextPaper>ไม่พบข้อมูลการรับประกัน</TextPaper>
        )}
      </KeyboardAwareScrollView>
      <SignatureModal
        visible={signatureModal}
        onClose={onCloseSignature}
        sellerSignature={sellerSignature ? sellerSignature : ''}
        setLoadingWebP={setIsLoadingWebP}
        title="ลายเซ็นของผู้ขาย"
        setSelectedSignature={setSelectedSignature}
      />

      {pdfUrl && (
        <>
          <PDFModalScreen
            fileType="ใบรับประกัน"
            fileName={editQuotation.customer.name}
            visible={showPDFModal}
            onClose={closePDFModal}
            pdfUrl={pdfUrl}
          />
        </>
      )}
    </FormProvider>
  );
};

export default CreateWarranty;

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  containerForm: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    marginTop: 10,
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
  formInput: {
    marginTop: 5,
  },
  formCondition: {
    marginTop: 5,
    paddingBottom: 20,
  },
  rowForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelSuffix: {
    fontFamily: 'sukhumvit set',
    fontSize: 16,
    marginLeft: 5,
    width: width * 0.3,
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
  containerModal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width,
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
  date: {
    fontSize: 14,
  },
  label: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 10,
    maxWidth: width * 0.6,
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
  errorText: {
    color: 'red',
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
    borderWidth: 1,
    marginTop: 20,
    borderColor: '#ccc',
    flexDirection: 'column',
    margin: 5,
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
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signHeader: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 16,
    color: '#19232e',
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
  modal: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    height: height * 0.2,
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
    fontSize: 16,
    marginTop: 20,
  },
  listDescription: {
    fontSize: 14,

    marginLeft: 10,
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
