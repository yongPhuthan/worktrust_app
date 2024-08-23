import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import Decimal from 'decimal.js-light';
import { nanoid } from 'nanoid';
import CurrencyInput from 'react-native-currency-input';
import {
  Appbar,
  Button,
  Divider,
  IconButton,
  TextInput,
  Text as TextPaper,
} from 'react-native-paper';
import { DiscountType } from '../../types/enums';
import GalleryScreen from '../gallery/existing';
import ExistingMaterials from '../materials/existing';
import SelectStandard from '../standard/selectStandard';

import { MaterialSchemaType } from '../../validation/collection/subcollection/materials';
import { StandardSchemaType } from '../../validation/collection/subcollection/standard';
import { serviceSchema, ServiceSchemaType } from '../../validation/field/services';


type Props = {
  onAddService: (data: ServiceSchemaType) => void;
  onClose: () => void;
  visible: boolean;
  selectService: ServiceSchemaType | null;
  resetSelectService: () => void;
  resetAddNewService: () => void;
};

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const AddProductFormModal = (props: Props) => {
  // const {control, handleSubmit, watch} = useForm<FormData>();
  const {
    onAddService,
    onClose,
    visible,
    selectService,
    resetSelectService,
    resetAddNewService,
  } = props;
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalMaterialsVisible, setIsModalMaterialsVisible] = useState(false);
  const [isModalImagesVisible, setModalImagesVisible] = useState(false);
  // const {isImageUpload, imageUrl, handleLogoUpload} = useImageUpload();
  const [serviceID, setServiceID] = useState<string>('');
  const handleDone = () => {
    methods.setValue('id', nanoid());
    onAddService(methods.watch());
    onClose();
    methods.reset();
    resetSelectService();
    resetAddNewService();
  };

  const defaultService: ServiceSchemaType = {
    id: nanoid(),
    title: '',
    description: '',
    unitPrice: 0,
    qty: 1,
    total: 0,
    unit: 'ชุด',
    images: [],
    discountType: DiscountType.NONE,
    discountValue: 0,
    standards: [],
    materials: [],
    created: new Date(),
  };
  const methods = useForm<ServiceSchemaType>({
    mode: 'onChange',
    defaultValues: selectService ? selectService : defaultService,
    resolver: yupResolver(serviceSchema),
  });
  const standards = useWatch({
    control: methods.control,
    name: 'standards',
  });
  const title = useWatch({
    control: methods.control,
    name: 'title',
  });

  const qty = useWatch({
    control: methods.control,
    name: 'qty',
  });
  const unit = useWatch({
    control: methods.control,
    name: 'unit',
  });

  const materials = useWatch({
    control: methods.control,
    name: 'materials',
  });

  const [unitPrice, quantity] = useWatch({
    control: methods.control,
    name: ['unitPrice', 'qty'],
  });

  const images = useWatch({
    control: methods.control,
    name: 'images',
  });

  useEffect(() => {
    const unitPriceValue = methods.watch('unitPrice') || '0';
    const quantityValue = methods.watch('qty') || '0';

    const unitPrice = new Decimal(Number(unitPriceValue));
    const quantity = new Decimal(Number(quantityValue));

    const total = unitPrice.times(Number(quantity));
    methods.setValue('total', Number(total));
    methods.setValue('unitPrice', Number(unitPrice));
    methods.setValue('qty', Number(quantity));
  }, [
    methods.watch('unitPrice'),
    methods.watch('qty'),
    methods.setValue,
    methods.formState.isDirty,
  ]);
  const isButtonDisbled = useMemo(() => {
    return title && unitPrice > 0 && qty > 0;
  }, [standards, materials, title, unitPrice, qty]);

  return (
    <Modal animationType="slide" visible={visible}>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.Action
          icon={'close'}
          onPress={() => {
            Alert.alert(
              'ปิดหน้าต่าง',
              'ยืนยันไม่บันทึกข้อมูลและปิดหน้าต่าง',
              [
                {
                  text: 'อยู่ต่อ',
                  style: 'cancel',
                },
                {
                  text: 'ปิดหน้าต่าง',
                  onPress: () => {
                    resetSelectService(),
                      resetAddNewService(),
                      onClose(),
                      methods.reset();
                  },
                },
              ],
              {cancelable: false},
            );
          }}
        />

        <Appbar.Content
          title="เพิ่มสินค้า-บริการ"
          titleStyle={{
            fontSize: 18,
          }}
        />
        <Button
          icon={'check'}
          disabled={!isButtonDisbled}
          // mode="outlined"
          onPress={handleDone}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <FormProvider {...methods}>
        <KeyboardAwareScrollView
          style={{flex: 1}}
          resetScrollToCoords={{x: 0, y: 0}}
          scrollEnabled={true}
          extraHeight={200}
          enableOnAndroid={true}>
          <View style={{flex: 1}}>
            <ScrollView style={styles.container}>
              <View style={styles.subContainer}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <FlatList
                    data={methods.watch('images')}
                    horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <View key={index} style={styles.imageContainer}>
                          <TouchableOpacity
                            onPress={() => setModalImagesVisible(true)}>
                            <Image
                              source={{uri: item.localPathUrl ?? ''}}
                              style={styles.image}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={
                      images && images.length > 0 ? (
                        <TouchableOpacity
                          style={styles.addButtonContainer}
                          onPress={() => {
                            setModalImagesVisible(true);
                          }}>
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={20}
                            color="#047e6e"
                          />
                        </TouchableOpacity>
                      ) : null
                    }
                    ListEmptyComponent={
                      <View>
                        <TouchableOpacity
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            borderColor: '#047e6e',
                            borderWidth: 1,
                            borderRadius: 5,
                            borderStyle: 'dashed',
                            padding: 10,
                            height: 150,
                            width: 200,
                          }}
                          onPress={() => setModalImagesVisible(true)}>
                          <IconButton
                            icon="image-plus"
                            iconColor={'#047e6e'}
                            size={40}
                            onPress={() => setModalImagesVisible(true)}
                          />
                          <Text
                            style={{
                              textAlign: 'center',
                              color: '#047e6e',
                            }}>
                            เพิ่มภาพตัวอย่างผลงาน
                          </Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 5,
                    marginVertical: 20,
                  }}>
                  <Controller
                    control={methods.control}
                    name="title"
                    rules={{required: true}}
                    render={({
                      field: {onChange, onBlur, value},
                      fieldState: {error},
                    }) => (
                      <View>
                        <TextInput
                          multiline
                          label={'ชื่อรายการ'}
                          onBlur={onBlur}
                          error={!!error}
                          mode="outlined"
                          onChangeText={onChange}
                          numberOfLines={2}
                          textAlignVertical="top"
                          value={value}
                        />
                        {error && (
                          <Text style={styles.errorText}>{error.message}</Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={methods.control}
                    name="description"
                    defaultValue=""
                    render={({
                      field: {onChange, value},
                      fieldState: {error},
                    }) => (
                      <TextInput
                        label={'รายละเอียด'}
                        keyboardType="name-phone-pad"
                        style={
                          Platform.OS === 'ios' && {
                            height: 80,
                            textAlignVertical: 'top',
                          }
                        }
                        mode="outlined"
                        numberOfLines={3}
                        multiline={true}
                        textAlignVertical="top"
                        error={!!error}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />

                  <Controller
                    control={methods.control}
                    name="unitPrice"
                    rules={{required: true}}
                    defaultValue={0}
                    render={({
                      field: {onChange, onBlur, value},
                      fieldState: {error},
                    }) => (
                      <CurrencyInput
                        placeholder="0"
                        onBlur={onBlur}
                        renderTextInput={(textInputProps: any) => (
                          <TextInput
                            left={<TextInput.Affix text={'ราคา/หน่วย'} />}
                            contentStyle={{
                              textAlign: 'center',
                            }}
                            right={<TextInput.Affix text={'บาท'} />}
                            {...textInputProps}
                            mode="outlined"
                            textAlignVertical="center"
                            keyboardType="number-pad"
                            textAlign="center"
                            error={!!error}
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
                  <View style={styles.summary}>
                    <Text style={styles.price}></Text>
                    <Controller
                      control={methods.control}
                      name="qty"
                      rules={{required: 'This field is required'}}
                      render={({
                        field: {onChange, onBlur, value},
                        fieldState: {error},
                      }) => (
                        <>
                          <TextInput
                            keyboardType="number-pad"
                            textAlign="center"
                            mode="outlined"
                            onChangeText={val => {
                              const numericValue = Number(val);
                              if (!isNaN(numericValue)) {
                                onChange(numericValue);
                              }
                            }}
                            defaultValue={String(qty)}
                            value={String(value)}
                            onBlur={onBlur}
                            error={!!error}
                            left={<TextInput.Affix text={'จำนวน'} />}
                            textAlignVertical="center"
                            right={<TextInput.Affix text={unit} />}
                          />
                        </>
                      )}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                    }}>
                    <TextPaper variant="headlineMedium">รวม</TextPaper>

                    <Controller
                      control={methods.control}
                      name="total"
                      defaultValue={0}
                      render={({field: {value}}) => (
                        <TextPaper variant="displaySmall">
                          {new Intl.NumberFormat('th-TH', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }).format(new Decimal(value).toNumber())}
                        </TextPaper>
                      )}
                    />
                  </View>
                </View>
                <Divider
                  style={{
                    marginVertical: 20,
                  }}
                />

                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View>
                    <Text
                      style={{
                        marginBottom: 10,

                        fontWeight: 'bold',
                        fontSize: 16,
                        color: '#333',
                      }}>
                      มาตรฐานของบริการนี้
                    </Text>
                    {methods.watch('standards')?.length ?? 0 > 0 ? (
                      <View
                        style={{
                          flexDirection: 'column',
                          gap: 10,
                        }}>
                        <TouchableOpacity
                          onPress={() => setModalVisible(true)}
                          style={styles.cardContainer}>
                          {methods
                            .watch('standards')
                            ?.map((item: StandardSchemaType, index) => (
                              <Text key={index}>
                                {item.standardShowTitle}
                              </Text>
                            ))}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Button
                        children="เพิ่มมาตรฐานการทำงาน"
                        style={{
                          borderColor: '#0073BA',
                          borderStyle: 'dotted',
                        }}
                        mode="outlined"
                        icon={'plus'}
                        textColor="#0073BA"
                        contentStyle={{
                          flexDirection: 'row-reverse',
                          justifyContent: 'space-between',
                        }}
                        onPress={() => setModalVisible(true)}></Button>
                    )}
                  </View>
                  <Divider
                    style={{
                      marginVertical: 20,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        marginBottom: 10,

                        fontSize: 16,
                        fontFamily: 'Sukhumvit Set Bold',
                        fontWeight: 'bold',
                        color: '#333',
                      }}>
                      วัสดุอุปกรณ์ที่ใช้
                    </Text>
                    {methods.watch('materials')?.length ?? 0 > 0 ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setIsModalMaterialsVisible(true)}
                          style={styles.cardContainer}>
                          {methods
                            .watch('materials')
                            ?.map((item: MaterialSchemaType, index: number) => (
                              <Text key={index}>{item.name}</Text>
                            ))}
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View>
                        <Button
                          children="เพิ่มวัสดุอุปกรณ์"
                          style={{
                            borderColor: '#0073BA',
                            borderStyle: 'dotted',
                          }}
                          mode="outlined"
                          icon={'plus'}
                          textColor="#0073BA"
                          contentStyle={{
                            flexDirection: 'row-reverse',
                            justifyContent: 'space-between',
                          }}
                          onPress={() =>
                            setIsModalMaterialsVisible(true)
                          }></Button>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <SelectStandard
                isVisible={isModalVisible}
                serviceId={methods.watch('id')}
                onClose={() => setModalVisible(false)}
                title={methods.watch('title')}
                description={methods.watch('description')}
              />
              <ExistingMaterials
                serviceId={serviceID}
                isVisible={isModalMaterialsVisible}
                onClose={() => setIsModalMaterialsVisible(false)}
              />
              {images && (
                <GalleryScreen
                  isVisible={isModalImagesVisible}
                  onClose={() => setModalImagesVisible(false)}
                  selectedImages={
                    images
                  }
                />
              )}
            </ScrollView>
          </View>
        </KeyboardAwareScrollView>
      </FormProvider>
    </Modal>
  );
};
export default AddProductFormModal;

const styles = StyleSheet.create({
  container: {},
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
  date: {
    textAlign: 'right',
  },
  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    width: 150,
    textAlign: 'right', // Add textAlign property
  },

  inputName: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    height: 40,
  },
  inputAddress: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    height: 100,
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',

    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    height: 40,
  },
  prefix: {
    paddingHorizontal: 5,
    paddingVertical: 5,

    fontWeight: 'bold',
    color: 'black',
  },
  containerPrice: {
    alignSelf: 'center',
  },
  imageContainer: {
    width: imageContainerWidth,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
  },
  addButtonContainer: {
    width: 100,
    margin: 5,
    height: 110,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#047e6e',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
  summary: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        paddingVertical: 10,
      },
      android: {
        paddingVertical: 10,
      },
    }),
  },
  summaryPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        paddingVertical: 10,
        marginTop: 20,
      },
      android: {
        paddingVertical: 10,
        marginTop: 20,
      },
    }),
  },
  priceSummary: {
    fontSize: 18,
    marginTop: 10,
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceSum: {
    fontSize: 18,
    color: 'black',
    marginTop: 15,
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceHead: {
    fontSize: 16,
    color: 'black',
    marginTop: 10,
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceTitle: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
    fontFamily: 'Sukhumvit Set Bold',
  },
  counter: {
    fontSize: 16,
    paddingHorizontal: 20,
  },
  containerCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: '#e9f4f9',

    width: 150,
    borderRadius: 5,
    borderWidth: 0.5,
  },
  selectButton: {
    // backgroundColor: '#0073BA',
    backgroundColor: 'white',
    borderColor: '#0073BA',
    borderWidth: 1,
    borderStyle: 'dotted',

    borderRadius: 5,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#0073BA',
    // fontFamily: 'Sukhumvit set',
    marginLeft: 10,
  },
  btnDisabled: {
    backgroundColor: '#ccc',
  },

  count: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    // ... other error text styles ...
  },
  button: {
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'column',
    gap: 10,
    borderWidth: 0.5,
    padding: 20,
    borderRadius: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'yellow',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    // fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#0073BA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageWrapper: {
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: 'black',
  },
  headingRight: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: '#397af8',
  },
});
