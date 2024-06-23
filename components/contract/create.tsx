import {yupResolver} from '@hookform/resolvers/yup';
import React, {useContext, useState} from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Appbar,
  Button,
  Divider,
  ProgressBar,
  TextInput,
  Text as TextPaper,
} from 'react-native-paper';
import {Store} from '../../redux/store';
import {defaultContractSchema} from '../../models/validationSchema';

import {Controller, useForm, useFormContext, useWatch} from 'react-hook-form';
import {useUser} from '../../providers/UserContext';
import {DefaultContractType} from '../../types/docType';

interface MyError {
  response: object;
}
type Props = {
  onClose: () => void;
  visible: boolean;
};

const ContractModal = (props: Props) => {
  const {visible, onClose} = props;
  const {
    dispatch,
    state: {defaultContract},
  }: any = useContext(Store);
  const [defaultContractValues, setDefaultContractValues] =
    useState<DefaultContractType>();
  const user = useUser();
  const initialValues = {
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
  const {
    control,
    handleSubmit,
    getValues,
    formState: {isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: defaultContract ? defaultContract : initialValues,
    resolver: yupResolver(defaultContractSchema),
  });

  const context = useFormContext();
  const {register,  setValue, watch} = context as any;

  const contract = context.watch('contract');
  const adjustPerDay = useWatch({control, name: 'adjustPerDay'});
  const allTotal = useWatch({control, name: 'allTotal'});
  function safeToString(value: string | number | null | undefined) {
    return value !== undefined && value !== null ? value.toString() : '';
  }

  const renderWanranty = (
    name: any,
    label: string,
    defaultValue: string = '',
    textAffix: string,
  ) => (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.label}>{label}</Text>

        <Controller
          control={control}
          rules={{required: 'This field is required'}}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <View
              style={{
                flexDirection: 'column',
              }}>
              {error && <Text style={styles.errorText}>{error.message}</Text>}

              <TextInput
                keyboardType="number-pad"
                style={{width: Dimensions.get('window').width * 0.3}}
                textAlign="center"
                error={!!error}
                mode="outlined"
                textAlignVertical="center"
                defaultValue={defaultValue}
                onBlur={onBlur}
                right={<TextInput.Affix text={textAffix} />}
                value={value ? String(value) : '0'}
                onChangeText={val => {
                  const numericValue = parseInt(val, 10);
                  if (!isNaN(numericValue)) {
                    onChange(numericValue);
                  } else {
                    onChange(0);
                  }
                }}
              />
            </View>
          )}
          name={name}
        />
      </View>
    </>
  );
  const renderPrepare = (
    name: any,
    label: string,
    defaultValue: string = '',
  ) => (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.label}>{label}</Text>

        <Controller
          control={control}
          rules={{required: 'This field is required'}}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <View
              style={{
                flexDirection: 'column',
              }}>
              {error && <Text style={styles.errorText}>{error.message}</Text>}

              <TextInput
                keyboardType="number-pad"
                textAlign="center"
                style={{
                  width: Dimensions.get('window').width * 0.3,
                  maxHeight: 55,
                }}
                error={!!error}
                mode="outlined"
                textAlignVertical="center"
                defaultValue={defaultValue}
                onBlur={onBlur}
                right={<TextInput.Affix text="วัน" />}
                value={value ? String(value) : '0'}
                onChangeText={val => {
                  const numericValue = parseInt(val, 10);
                  if (!isNaN(numericValue)) {
                    onChange(numericValue);
                  } else {
                    onChange(0);
                  }
                }}
              />
            </View>
          )}
          name={name}
        />
      </View>
    </>
  );

  const renderAdjustMents = (
    name: any,
    label: string,
    defaultValue: string = '',
  ) => (
    <>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          marginTop: 10,
        }}>
        <Text style={styles.labelAuditAndAdjustment}>{label}</Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 10,
            justifyContent: 'flex-start',
            alignContent: 'stretch',
            gap: 10,
          }}>
          <Controller
            control={control}
            rules={{required: 'This field is required'}}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <View
                style={{
                  flexDirection: 'column',
                }}>
                {error && <Text style={styles.errorText}>{error.message}</Text>}

                <TextInput
                  keyboardType="number-pad"
                  textAlign="center"
                  style={{width: Dimensions.get('window').width * 0.3}}
                  error={!!error}
                  mode="outlined"
                  textAlignVertical="center"
                  defaultValue={defaultValue}
                  onBlur={onBlur}
                  right={<TextInput.Affix text="%" />}
                  value={value ? String(value) : '0'}
                  onChangeText={val => {
                    const numericValue = parseInt(val, 10);
                    if (!isNaN(numericValue)) {
                      onChange(numericValue);
                    } else {
                      onChange(0);
                    }
                  }}
                />
              </View>
            )}
            name={name}
          />

        </View>
        {adjustPerDay > 0 && allTotal ? (
            <Text style={{marginTop: 10}}>
              เป็นเงิน
              {Number(allTotal - Number(allTotal * (1 - adjustPerDay / 100)))
                .toFixed(2)
                .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
              บาท/วัน
            </Text>
          ) : <Text style={{marginTop: 10}}>เป็นเงิน  0  บาท/วัน</Text>}
      </View>
    </>
  );
  const renderAudits = (
    name: any,
    label: string,
    defaultValue: string = '',
  ) => (
    <>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          marginTop: 10,
          marginBottom: 30,
        }}>
        <Text style={styles.labelAuditAndAdjustment}>{label}</Text>

        <Controller
          control={control}
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
              <TextInput
                keyboardType="number-pad"
                textAlign="center"
                style={{
                  width: Dimensions.get('window').width * 0.3,
                  marginTop: 10,
                }}
                error={!!error}
                mode="outlined"
                textAlignVertical="center"
                defaultValue={defaultValue}
                onBlur={onBlur}
                right={<TextInput.Affix text="วัน" />}
                value={value ? String(value) : '0'}
                onChangeText={val => {
                  const numericValue = parseInt(val, 10);
                  if (!isNaN(numericValue)) {
                    onChange(numericValue);
                  } else {
                    onChange(0);
                  }
                }}
              />
            </>
          )}
          name={name}
        />
      </View>
    </>
  );
  return (
    <Modal animationType="slide" visible={visible}>
      <Appbar.Header
        style={{
          backgroundColor: 'white',
        }}
        elevated
        mode="center-aligned">
        <Appbar.Action
          icon={'close'}
          onPress={() => {
            onClose();
          }}
        />
        <Appbar.Content
          title="ข้อเสนอสัญญา"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
          }}
        />
        <Button
          disabled={!isValid}
          mode="contained"
          onPress={async () => {
            await setValue('contract', getValues());
            onClose();
          }}
          style={{marginRight: 5}}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>

      <KeyboardAwareScrollView contentContainerStyle={{paddingBottom: 50}}>
        {contract ? (
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การรับประกัน</TextPaper>
              <Divider style={{marginTop: 10}} />

              <View style={styles.formInput}>
                {renderWanranty(
                  'productWarantyYear',
                  'รับประกันวัสดุอุปกรณ์กี่เดือน',
                  safeToString(contract.productWarantyYear),
                  'เดือน',
                )}
                {renderWanranty(
                  'skillWarantyYear',
                  'รับประกันงานติดตั้งกี่เดือน',
                  safeToString(contract.skillWarantyYear),
                  'เดือน',
                )}
                {renderWanranty(
                  'fixDays',
                  'เมื่อมีปัญหาจะแก้ไขงานให้แล้วเสร็จภายในกี่วัน',
                  safeToString(contract.fixDays),
                  'วัน',
                )}
              </View>
            </View>

            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การเตรียมงาน</TextPaper>

              <Divider style={{marginTop: 10}} />
              <View style={styles.formInput}>
                {renderPrepare(
                  'installingDay',
                  'ใช้เวลาติดตั้งที่หน้างานกี่วัน',
                  'installDay',
                )}
                {renderPrepare(
                  'workAfterGetDeposit',
                  'เริ่มทำงานภายในกี่วันหลังได้รับมัดจำ',
                  'workAfterGetDeposit',
                )}
                {renderPrepare(
                  'prepareDay',
                  'ใช้เวลาเตรียมงานกี่วันก่อนติดตั้ง',
                  'prepareDay',
                )}
                {renderPrepare(
                  'finishedDay',
                  'รวมใช้เวลาทำงานทั้งหมดกี่วัน',
                  'finishedDay',
                )}
              </View>
            </View>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การตรวจงาน</TextPaper>

              <Divider style={{marginTop: 10}} />
              <View style={styles.formInput}>
                {renderAudits(
                  'workCheckDay',
                  'หลังแจ้งส่งมอบงานผู้ว่าจ้างต้องตรวจงานภายในกี่วัน',
                  'workCheckDay',
                )}
                {renderAudits(
                  'workCheckEnd',
                  'นับจากวันที่ผู้ว่าจ้างได้ตรวจรับความถูกต้องแล้วผู้ว่าจ้างจะต้องชำระเงินภายในกี่วัน',
                  'workCheckEnd',
                )}
              </View>
            </View>
            <View style={styles.containerLastForm}>
              <TextPaper variant="headlineSmall">การคิดค่าปรับ</TextPaper>

              <Divider style={{marginTop: 10}} />
              <View style={styles.formInput}>
                {renderAdjustMents(
                  'adjustPerDay',
                  'หากส่งงานล่าช้าให้ผู้ว่าจ้างคิดค่าปรับเป็นรายวันกี่เปอร์เซ็นต์ของมูลค่างานตามสัญญาต่อวัน',
                  'adjustPerDay',
                )}
              </View>
              <View style={{marginBottom: 50}}></View>
            </View>
          </SafeAreaView>
        ) : (
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การรับประกัน</TextPaper>
              <Divider style={{marginTop: 10}} />

              <View style={styles.formInput}>
                {renderWanranty(
                  'productWarantyYear',
                  'รับประกันวัสดุอุปกรณ์กี่เดือน',
                  '',
                  'เดือน',
                )}
                {renderWanranty(
                  'skillWarantyYear',
                  'รับประกันงานติดตั้งกี่เดือน',
                  '',
                  'เดือน',
                )}
                {renderWanranty(
                  'fixDays',
                  'เมื่อมีปัญหาจะแก้ไขงานให้แล้วเสร็จภายในกี่วัน',
                  '',
                  'วัน',
                )}
              </View>
            </View>

            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การเตรียมงาน</TextPaper>

              <Divider style={{marginTop: 10}} />
              <View style={styles.formInput}>
                {renderPrepare(
                  'installingDay',
                  'ใช้เวลาติดตั้งที่หน้างานกี่วัน',
                )}
                {renderPrepare(
                  'workAfterGetDeposit',
                  'เริ่มทำงานภายในกี่วันหลังได้รับมัดจำ',
                )}
                {renderPrepare(
                  'prepareDay',
                  'ใช้เวลาเตรียมงานกี่วันก่อนติดตั้ง',
                )}
                {renderPrepare('finishedDay', 'รวมใช้เวลาทำงานทั้งหมดกี่วัน')}
              </View>
            </View>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การตรวจงาน</TextPaper>

              <Divider style={{marginTop: 10}} />
              <View style={styles.formInput}>
                {renderAudits(
                  'workCheckDay',
                  'หลังแจ้งส่งมอบงานผู้ว่าจ้างต้องตรวจงานภายในกี่วัน',
                )}
                {renderAudits(
                  'workCheckEnd',
                  'นับจากวันที่ผู้ว่าจ้างได้ตรวจรับความถูกต้องแล้วผู้ว่าจ้างจะต้องชำระเงินภายในกี่วัน',
                )}
              </View>
            </View>
            <View style={styles.containerLastForm}>
              <TextPaper variant="headlineSmall">การคิดค่าปรับ</TextPaper>

              <Divider style={{marginTop: 10}} />
              <View style={styles.formInput}>
                {renderAdjustMents(
                  'adjustPerDay',
                  'หากส่งงานล่าช้าให้ผู้ว่าจ้างคิดค่าปรับเป็นรายวันกี่เปอร์เซ็นต์ของมูลค่างานตามสัญญาต่อวัน',
                )}
              </View>
              <View style={{marginBottom: 50}}></View>
            </View>
          </SafeAreaView>
        )}
      </KeyboardAwareScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerForm: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  containerLastForm: {
    flex: 1,
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
    flex: 1,
    // marginTop: 30,
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
    marginTop: 40,
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
  inputContainerForm1: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA', // A light color for odd rows

    width: 80,
    height: Platform.OS === 'android' ? 50 : 50, // Adjust height based on platform
    paddingVertical: Platform.OS === 'android' ? 0 : 15, // Remove padding for Android
  },
  inputContainerForm: {
    marginTop: 10,
    borderWidth: 0.5,
    borderRadius: 5,

    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Keep even rows white

    width: 80,
    height: Platform.OS === 'android' ? 50 : 50, // Adjust height based on platform
    paddingVertical: Platform.OS === 'android' ? 0 : 15, // Remove padding for Android
  },
  label: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    marginTop: 20,
    maxWidth: Dimensions.get('window').width * 0.6,
  },
  labelAuditAndAdjustment: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    // marginTop: 20,
  },
  inputForm: {
    // backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 0.5,

    height: 10,

    // paddingHorizontal: 10,
  },
  inputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputSuffix: {
    // flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'flex-end',
  },
  inputFormRight: {
    flex: 1,
    // backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    minHeight: 50,
    minWidth: 200,
    height: 500,

    width: 50,
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
  rowOdd: {
    backgroundColor: '#FAFAFA', // A light color for odd rows
  },
  rowEven: {
    backgroundColor: '#FFFFFF', // Keep even rows white
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#E0E0E0', // A light grey color for the divider
    marginTop: 1,
    marginBottom: 1, // Adjust spacing as needed
  },
  errorText: {
    color: 'red',
  },
});

export default ContractModal;
