import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import {
  Appbar,
  Button,
  Divider,
  SegmentedButtons,
  Switch,
  Text,
  TextInput
} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import DocNumber from '../../components/DocNumber';
import DatePickerButton from '../../components/styles/DatePicker';
import useSelectedDates from '../../hooks/quotation/create/useSelectDates';
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import { TaxType } from '../../models/Tax';
import { Store } from '../../redux/store';
import { ParamListBase } from '../../types/navigationType';

import Decimal from 'decimal.js-light';
import { Controller, useForm, useWatch } from 'react-hook-form';
import PDFModalScreen from '../../components/webview/pdf';
import useCreateNewDepositInvoice from '../../hooks/invoice/deposit/useCreateDeposit';
import { useModal } from '../../hooks/quotation/create/useModal';
import useCreateNewDepositReceipt from '../../hooks/receipt/useCreateDeposit';
const taxLabel = [
  {label: '3%', value: 3},
  {label: '5%', value: 5},
];
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'ReceiptDepositScreen'>;
}
const ReceiptDepositScreen = ({navigation}: Props) => {
  const {
    dispatch,
    state: {editQuotation},
  }: any = useContext(Store);

  const [amount, setAmount] = React.useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>('');
  const [openNoteToCustomer, setOpenNoteToCustomer] = useState(false);
  const [openNoteToTeam, setOpenNoteToTeam] = useState(false);
  const [value, setValue] = React.useState('');
  const thaiDateFormatter = useThaiDateFormatter();

  const [selectedValue, setSelectedValue] = useState(0);
  const [vat7Picker, setVat7Picker] = useState(false);
  const {
    initialDocnumber,
    initialDateOfferFormatted,
    initialDateEndFormatted,
    initialDateEnd,
    initialDateOffer,
  } = useSelectedDates();
  const [dateOfferFormatted, setDateOfferFormatted] = useState<string>(
    initialDateOfferFormatted,
  );
  const {
    openModal: openPDFModal,
    closeModal: closePDFModal,
    isVisible: showPDFModal,
  } = useModal();
  const methods = useForm({
    defaultValues: {
      vat7: 0,
      quotationId: editQuotation.id,
      taxType: TaxType.NOTAX,
      depositApplied: 0,
      allTotal: editQuotation.allTotal,
      dateOffer: initialDateOffer,
      docNumber: `RCD${initialDocnumber}`,
      taxValue: 0,
      netAmount: 0,
      remaining: 0,
      noteToCustomer: '',
      noteToTeam: '',
      quotationRefNumber: editQuotation.docNumber,
    },
    mode: 'onChange',
  });
  const depositApplied = useWatch({
    control: methods.control,
    name: 'depositApplied',
  });
  const netAmount = useWatch({
    control: methods.control,
    name: 'netAmount',
  });

  const remaining = useWatch({
    control: methods.control,
    name: 'remaining',
  });
  const vat7 = useWatch({
    control: methods.control,
    name: 'vat7',
  });
  const allTotal = useWatch({
    control: methods.control,
    name: 'allTotal',
  });

  const taxValue = useWatch({
    control: methods.control,
    name: 'taxValue',
  });

  const handleStartDateSelected = (date: Date) => {
    setDateOfferFormatted(thaiDateFormatter(date));
    methods.setValue('dateOffer', date);
  };
  const handleInvoiceNumberChange = (text: string) => {
    methods.setValue('docNumber', text);
  };

  const handleQuotationRefNumberChange = (text: string) => {
    methods.setValue('quotationRefNumber', text);
  };

  useEffect(() => {
    if (vat7Picker) {
      const vatAmount = depositApplied
        ? new Decimal(depositApplied).times(0.07).toNumber()
        : 0;

      methods.setValue('vat7', vatAmount);
    } else {
      methods.setValue('vat7', 0);
    }
  }, [vat7Picker, allTotal, methods.setValue, depositApplied]);

  useEffect(() => {
    if (pickerVisible) {
      const taxAmount = depositApplied
        ? new Decimal(depositApplied).times(selectedValue).div(100).toNumber()
        : 0;
      methods.setValue('taxValue', taxAmount);
    } else {
      setSelectedValue(0);
      methods.setValue('taxValue', 0);
    }
  }, [
    pickerVisible,
    selectedValue,
    allTotal,
    methods.setValue,
    depositApplied,
  ]);

  //   trigger netAmount and remaining when depositRequired, vat7, selectedValue, allTotal change
  useEffect(() => {
    const {total, remaining} = calculateTotal();
    methods.setValue('netAmount', total);
    methods.setValue('remaining', remaining);
  }, [depositApplied, vat7, selectedValue, allTotal, methods.setValue]);

  const calculateTotal = () => {
    const taxAmount = (depositApplied * selectedValue) / 100;
    const total = new Decimal(depositApplied || 0) // Default to 0 if null or undefined
      .plus(vat7)
      .minus(taxAmount)
      .toNumber();

    const remaining = new Decimal(allTotal).minus(total).toNumber();

    return {total, remaining};
  };
  const actions: any = {
    setPdfUrl,
    openPDFModal,
  };

  const {mutate, isPending} = useCreateNewDepositReceipt(actions);
  const handleDeposit = async () => {
    const deposit = depositApplied;
    if (isNaN(deposit) || deposit <= 0) {
      Alert.alert('ยอดมัดจำต้องมากกว่า 0 บาท');
      return;
    }
    if (remaining < 0) {
      Alert.alert('ยอดชำระคงเหลือต้องมากกว่า 0 บาท');
      return;
    }
    await mutate(methods.getValues());
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
          title="มัดจำใบเสร็จรับเงิน"
          titleStyle={{
            fontSize: 18,
            fontFamily: 'Sukhumvit Set Bold',
            fontWeight: 'bold',
          }}
        />
        <Button
          mode="contained"
          loading={isPending}
          onPress={() => {
            handleDeposit();
          }}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.subContainerHead}>
          <DatePickerButton
            label="วันที่"
            title="วันที่"
            date="today"
            onDateSelected={handleStartDateSelected}
          />
          <DocNumber
            label="เลขที่เอกสาร"
            onChange={handleInvoiceNumberChange}
            value={methods.watch('docNumber')}
          />
          <DocNumber
            label="อ้างอิงใบเสนอราคาเลขที่"
            onChange={handleQuotationRefNumberChange}
            value={methods.watch('quotationRefNumber')}
          />
        </View>
        <View style={styles.subContainer}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          
          }}>
          <Text style={styles.summaryTaxVat}>ลูกค้า:</Text>
          <Text style={styles.summaryTaxVat}>{editQuotation.customer.name}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',

          }}>
          <Text style={styles.summaryTaxVat}>ยอดรวมทั้งหมด:</Text>
          <Text style={styles.summaryTaxVat}>
            {new Intl.NumberFormat('th-TH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(editQuotation.allTotal)}
          </Text>
        </View>
        <Controller
          control={methods.control}
          name="depositApplied"
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <CurrencyInput
              onBlur={onBlur}
              renderTextInput={(textInputProps: any) => (
                <TextInput
                  left={<TextInput.Affix text={'ยอดมัดจำ'} />}
                  contentStyle={{
                    textAlign: 'center',
                  }}
                  right={<TextInput.Affix text={'บาท'} />}
                  {...textInputProps}
                  mode="outlined"
                  textAlignVertical="center"
                  keyboardType="number-pad"
                  error={!!error}
                  textAlign="center"
                  style={{
                    marginTop: 10,
                  }}
                />
              )}
              onChangeValue={newValue => {
                onChange(newValue);
              }}
              value={value}
              delimiter=","
              separator="."
              precision={0}
              minValue={0}
            />
          )}
        />
        <Divider />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',

            marginTop: 20,
          }}>
          <Text style={styles.summaryTaxVat}>รวมเป็นเงิน</Text>

          <Controller
            control={methods.control}
            name="depositApplied"
            defaultValue={0}
            render={({field: {value}}) => (
              <Text variant="titleLarge">
                {value
                  ? new Intl.NumberFormat('th-TH', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(new Decimal(value).toNumber())
                  : 0}
              </Text>
            )}
          />
        </View>
        {/* <View style={styles.summary}>
          <Text style={styles.summaryTaxVat}>หัก ณ ที่จ่าย</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setPickerVisible(!pickerVisible)}
            value={pickerVisible}
            style={Platform.select({
              ios: {
                transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                marginTop: 5,
              },
              android: {},
            })}
          />
        </View> */}
        {/* {pickerVisible && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 10,
              }}>
              {taxLabel.map(tax => (
                <View
                  key={tax.value}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Checkbox.Android
                    status={
                      selectedValue === tax.value ? 'checked' : 'unchecked'
                    }
                    onPress={() => setSelectedValue(tax.value)}
                  />
                  <Text>{tax.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.summaryText}>
              {new Intl.NumberFormat().format(taxValue)}
            </Text>
          </View>
        )} */}
        <Divider />
        <View style={styles.summary}>
          <Text style={[styles.summaryTaxVat]}>ภาษีมูลค่าเพิ่ม </Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setVat7Picker(!vat7Picker)}
            value={vat7Picker}
            style={[
              {},
              Platform.select({
                ios: {
                  transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                },
                android: {
                  transform: [{scaleX: 1}, {scaleY: 1}],
                },
              }),
            ]}
          />
        </View>
        {vat7Picker && (
          <View style={styles.pickerWrapper}>
            <Text style={styles.summaryText}> 7 % </Text>

            <Text
              style={Platform.select({
                ios: {
                  fontSize: 16,
                },
                android: {
                  fontSize: 16,
                  marginVertical: 10,
                },
              })}>
              {new Intl.NumberFormat('th-TH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(new Decimal(vat7).toNumber())}
            </Text>
          </View>
        )}
        <Divider />
        {/* Summarysection*/}
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTaxVat}>จำนวนรวมทั้งสิ้น</Text>
          <Text variant="titleLarge">
            {new Intl.NumberFormat('th-TH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(netAmount)}
          </Text>
        </View>
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTaxVat}>ยอดชำระคงเหลือ</Text>
          <Text variant="titleMedium">
            {new Intl.NumberFormat('th-TH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(remaining)}
          </Text>
        </View>
        <Divider />
        <View style={styles.signatureRow}>
          <Text style={styles.signHeader}>หมายเหตุ</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={openNoteToCustomer ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setOpenNoteToCustomer(!openNoteToCustomer)}
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
                    value={value}
                  />
                </View>
              )}
            />
          </View>
        )}
        <Divider />
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
          <View
            style={{
              marginBottom: 100,
            }}>
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
                    value={value}
                  />
                </View>
              )}
            />
          </View>
        )}
        </View>
      </KeyboardAwareScrollView>

      {pdfUrl && (
        <>
          <PDFModalScreen
            fileName={editQuotation.customer.name}
            visible={showPDFModal}
            onClose={closePDFModal}
            pdfUrl={pdfUrl}
          />

          <SegmentedButtons
            style={{
    
              padding: 20,
              maxWidth: '90%',
         
            }}
            value={value}
            onValueChange={setValue}
            
            buttons={[
              {
                value: 'train',
          
                label: 'PDF',
                icon: 'file-document',
                
                onPress: () => openPDFModal(),
              },
              
            ]}
          />
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100,
    width: '100%',
  },
  subContainerHead: {
    padding: 30,
    // backgroundColor:'#f3f8f3',
    backgroundColor: '#e9f7ff',
    height: 'auto',
    flexDirection: 'column',
    gap: 10,
  },
  subContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    marginBottom: 10,
    height: 'auto',
    paddingBottom: 200,

  },
  summaryTaxVat: {
    fontSize: 16,
    marginVertical: 10,
    color: '#19232e',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#19232e',
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 10,
    color: '#19232e',
  },
  summaryTax: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    color: '#19232e',
  },
  summaryTotal: {
    flexDirection: 'row',
    marginBottom: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#19232e',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: '#19232e',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#495057',
  },
  input: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerAndroidContainer: {
    borderWidth: 0.2,
    borderColor: 'gray',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'white',
    width: 100,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  signHeader: {
    flexDirection: 'row',
    marginVertical: 10,
    fontSize: 16,
    color: '#19232e',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },

  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});
export default ReceiptDepositScreen;
