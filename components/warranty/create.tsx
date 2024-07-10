import React, {useContext,useMemo} from 'react';
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
  TextInput,
  Text as TextPaper,
} from 'react-native-paper';
import {Store} from '../../redux/store';

import {Controller, useFormContext} from 'react-hook-form';
import {WarrantyEmbed} from '@prisma/client';

type Props = {
  onClose: () => void;
  visible: boolean;
};

const WarrantyModal = (props: Props) => {
  const {visible, onClose} = props;
  const {
    dispatch,
    state: {defaultWarranty},
  } = useContext(Store);

  const context = useFormContext();

  const {register, control, getValues, setValue, watch} = context;

  const warranty: WarrantyEmbed = watch('warranty');

  function safeToString(value: string | number | null | undefined) {
    return value !== undefined && value !== null ? value.toString() : '';
  }

  const isDisabled = useMemo(() => 
    warranty.productWarrantyMonth === 0 ||
    warranty.skillWarrantyMonth === 0 ||
    warranty.fixDays === 0 ||
    warranty.condition === '',
    [warranty.productWarrantyMonth, warranty.skillWarrantyMonth, warranty.fixDays, warranty.condition]
  );

  const renderWanranty = (
    name: string,
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
          title="รายละเอียด"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
          }}
        />
        <Button
          disabled={isDisabled}
          mode="outlined"
          onPress={() => onClose()}
          style={{marginRight: 5}}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>

      <KeyboardAwareScrollView contentContainerStyle={{paddingBottom: 50}}>
        {defaultWarranty ? (
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การรับประกัน</TextPaper>
              <Divider style={{marginTop: 10}} />

              <View style={styles.formInput}>
                {renderWanranty(
                  'warranty.productWarrantyMonth',
                  'รับประกันวัสดุอุปกรณ์กี่เดือน',
                  safeToString(warranty.productWarrantyMonth),
                  'เดือน',
                )}
                {renderWanranty(
                  'warranty.skillWarrantyMonth',
                  'รับประกันงานติดตั้งกี่เดือน',
                  safeToString(warranty.skillWarrantyMonth),
                  'เดือน',
                )}
                {renderWanranty(
                  'warranty.fixDays',
                  'เมื่อมีปัญหาจะแก้ไขงานให้แล้วเสร็จภายในกี่วัน',
                  safeToString(warranty.fixDays),
                  'วัน',
                )}
              </View>
            </View>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">
                เงื่อนไข-ข้อยกเว้นในการรับประกัน
              </TextPaper>
              <Divider style={{marginVertical: 10}} />
              <View style={styles.formInput}>
                <Controller
                  control={control}
                  rules={{required: 'ระบุเงื่อนไข-ข้อยกเว้นในการรับประกัน'}}
                  render={({
                    field: {onChange, onBlur, value},
                    fieldState: {error},
                  }) => (
                    <View
                      style={{
                        flexDirection: 'column',
                      }}>
                      <TextInput
                        style={{
                          width: Dimensions.get('window').width * 0.9,
                          height: Dimensions.get('window').height * 0.3,
                        }}
                        textAlign="center"
                        placeholder=""
                        defaultValue={defaultWarranty.condition}
                        multiline
                        numberOfLines={5}
                        error={!!error}
                        mode="outlined"
                        textAlignVertical="top"
                        onBlur={onBlur}
                        value={value}
                        onChangeText={onChange}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                  name="warranty.condition"
                />
              </View>
            </View>
          </SafeAreaView>
        ) : (
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">การรับประกัน</TextPaper>
              <Divider style={{marginTop: 10}} />

              <View style={styles.formInput}>
                {renderWanranty(
                  'warranty.productWarrantyMonth',
                  'รับประกันวัสดุอุปกรณ์กี่เดือน',
                  '',
                  'เดือน',
                )}
                {renderWanranty(
                  'warranty.skillWarrantyMonth',
                  'รับประกันงานติดตั้งกี่เดือน',
                  '',
                  'เดือน',
                )}
                {renderWanranty(
                  'warranty.fixDays',
                  'เมื่อมีปัญหาจะแก้ไขงานให้แล้วเสร็จภายในกี่วัน',
                  '',
                  'วัน',
                )}
              </View>
            </View>

            <View style={styles.containerForm}>
              <TextPaper variant="headlineSmall">
                เงื่อนไข-ข้อยกเว้นในการรับประกัน
              </TextPaper>

              <Divider style={{marginTop: 10}} />
              <View style={styles.formInput}>
                <Controller
                  control={control}
                  rules={{required: 'ระบุเงื่อนไข-ข้อยกเว้นในการรับประกัน'}}
                  render={({
                    field: {onChange, onBlur, value},
                    fieldState: {error},
                  }) => (
                    <View
                      style={{
                        flexDirection: 'column',
                      }}>
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                      <TextInput
                        style={{
                          width: Dimensions.get('window').width * 0.9,
                          height: Dimensions.get('window').height * 0.3,
                        }}
                        textAlign="center"
                        defaultValue="
                        รับประกันคุณภาพตัวสินค้า ตามมาตรฐานในการใช้งานตามปกติเท่านั้น ขอสงวนสิทธ์การรับประกันที่เกิดจากการใช้งานสินค้าที่ไม่ถูกต้องหรือความเสียหายที่เกิดจากภัยธรรมชาติ หรือ การใช้งานผิดประเภทหรือปัญหาจากการกระทําของบคุคลอื่น เช่นความเสียหายที่เกิดจากการทำงานของผู้รับเหมาทีมอื่นหรือบุคคลที่สามโดยตั้งใจหรือไม่ได้ตั้งใจ"
                        multiline
                        numberOfLines={4}
                        error={!!error}
                        mode="outlined"
                        textAlignVertical="top"
                        onBlur={onBlur}
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                  name="warranty.condition"
                />
              </View>
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
    width: '100%',
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

export default WarrantyModal;
