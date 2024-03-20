import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import SmallDivider from '../styles/SmallDivider';
import {useForm, Controller, useFormContext, set} from 'react-hook-form';

type Props = {
  title: string;
  price: number;
  onValuesChange: (
    total: number,
    discountValue: number,
    sumAfterDiscount: number,
    vat7Amount: number,
    vat3Amount: number,
  ) => void;
};

const windowWidth = Dimensions.get('window').width;

const SummaryEdit = (props: Props) => {
  const context = useFormContext();
  const {
    control,
    getValues,
    watch,
    setValue,
    formState: {isDirty, dirtyFields},
  } = useFormContext();
  const initialTaxName = context.watch('taxName');
  const initialVat7 = context.watch('vat7');
  const [pickerVisible, setPickerVisible] = useState(initialTaxName !== undefined && initialTaxName !== 'none');
  const [selectedValue, setSelectedValue] = useState(initialTaxName === 'vat3' ? 3 : initialTaxName === 'vat5' ? 5 : 0);
  const price = getValues('allTotal') ? getValues('allTotal') : 0;
  const discount = getValues('discountValue') ? getValues('discountValue') : 0;
  const [vat7, setVat7] = useState(initialVat7 !== undefined && initialVat7 !== 'none' && initialVat7 !== 0 
  && initialVat7 !== '0' ? true : false);

  const data = [
    {label: '0%', value: 0},
    {label: '3%', value: 3},
    {label: '5%', value: 5},
  ];
  // Calculate discount, sumAfterDiscount, vat7Amount, vat3Amount, and total
  const discountValue = (price * discount) / 100;
  const sumAfterDiscount = price - discountValue;
  const vat7Amount = vat7 ? sumAfterDiscount * 0.07 : 0;



  const taxAmount = pickerVisible
    ? (sumAfterDiscount * Number(selectedValue)) / 100
    : 0;
  const allTotal = sumAfterDiscount + vat7Amount - taxAmount;

  const handleSetVat7 = () => {
    setVat7(!vat7);
  };
  const handleSetTax = () => {
    setPickerVisible(!pickerVisible);
  };
  useEffect(() => {
    const newSumAfterDiscount = price - (price * discount) / 100 || 0; 
    const newVat7Amount = vat7 ? newSumAfterDiscount * 0.07 : 0;
    const newTaxAmount = pickerVisible ? (newSumAfterDiscount * Number(selectedValue)) / 100 : 0;
    const newAllTotal = newSumAfterDiscount + newVat7Amount - newTaxAmount;
  
  // Check if summaryAfterDiscount is an empty string and set it to 0
  if (watch('sumAfterDiscount') === '') {
    setValue('summaryAfterDiscount', 0);
  } else if (newSumAfterDiscount !== sumAfterDiscount) {
    setValue('summaryAfterDiscount', newSumAfterDiscount);
  }
    if (newAllTotal !== allTotal) {
      setValue('allTotal', newAllTotal, { shouldDirty: true });
    }
    if (pickerVisible) {
      const taxName = selectedValue === 3 ? 'vat3' : 'vat5';

      setValue('taxName', taxName, { shouldDirty: true });
      setValue('taxValue', newTaxAmount, { shouldDirty: true });
      

    } else if (selectedValue !== 0) {
      setSelectedValue(0);
      setValue('taxName', 'none', { shouldDirty: true });
      setValue('taxValue', 0, { shouldDirty: true });
    }
    if (vat7 && vat7Amount !== newVat7Amount) {
      setValue('vat7', Number(newVat7Amount).toFixed(2), { shouldDirty: true });
    } else if (!vat7 && vat7Amount !== 0) {
      setValue('vat7', 0, { shouldDirty: true });
    }
  }, [discount, price, vat7, selectedValue, pickerVisible]);
  
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{props.title}</Text>
        <Text style={styles.summaryPrice}>
          {Number(props.price)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ส่วนลดรวม</Text>
        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="discountValue"
            render={({field: {onChange, value, onBlur}}) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={value => {
                  onChange(value);
                }}
                value={value}
                keyboardType="numeric"
              />
            )}
            defaultValue=""
          />

          <Text style={styles.summaryText}>%</Text>
        </View>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ส่วนลดเป็นเงิน</Text>
        <Text style={styles.summaryPrice}>
          {Number(discountValue)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ยอดรวมหลังหักส่วนลด</Text>
        <Text style={styles.summaryPrice}>
          {Number(sumAfterDiscount)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
      <SmallDivider />
      <View style={styles.summary}>
        <Text style={styles.summaryTaxVat}>หัก ณ ที่จ่าย</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={handleSetTax}
          value={pickerVisible}
          style={Platform.select({
            ios: {
              transform: [{scaleX: 0.7}, {scaleY: 0.7}],
              marginTop: 5,
            },
            android: {},
          })}
        />
      </View>
      {pickerVisible && (
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerAndroidContainer}>
            <RNPickerSelect
              onValueChange={value => setSelectedValue(value)}
              items={data}
              value={selectedValue}
              style={pickerSelectStyles}
            />
          </View>
          <Text style={styles.summaryText}>
            {Number(taxAmount.toFixed(2))
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
          </Text>
        </View>
      )}
      <View style={styles.summary}>
        <Text style={[styles.summaryTaxVat]}>ภาษีมูลค่าเพิ่ม </Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={handleSetVat7}
          value={vat7}
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
      {vat7 && (
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
            {Number(vat7Amount.toFixed(2))
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
          </Text>
        </View>
      )}
      <View style={styles.summaryTotal}>
        <Text style={styles.totalSummary}>รวมทั้งสิ้น</Text>
        <Text style={styles.totalSummary}>
          {Number(allTotal)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
    </View>
  );
};

export default SummaryEdit;

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
    color: '#19232e',
  },
  container: {
    // width: windowWidth * 0.7,
    // alignSelf: 'flex-end',

    width: windowWidth * 0.85,
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 10,
    color: '#19232e',
    fontWeight: 'bold',

  },
  summaryTaxVat: {
    fontSize: 16,
    marginVertical: 10,
    color: '#19232e',
  },
  totalSummary: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#19232e',
  },
  summaryPrice: {
    fontSize: 18,
    marginVertical: 10,
    color: '#19232e',
  },
  pickerContainer: {
    flex: 1,
    height: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    height: 40,
    width: 100,
  },
  vat3Container: {
    flexDirection: 'row',
    alignItems: 'center',
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
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    textAlign: 'right',
    height: '100%',
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
