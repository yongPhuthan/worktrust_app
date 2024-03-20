import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  TextInput,
  Text,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import {v4 as uuidv4} from 'uuid';

import Divider from '../../../components/styles/Divider';
import {HOST_URL, PROJECT_FIREBASE, BACK_END_SERVER_URL} from '@env';
import {
  faCloudUpload,
  faClose,
  faPlus,
  faPlusCircle,
  faImages,
} from '@fortawesome/free-solid-svg-icons';
import {useForm, Controller, useFormContext, set} from 'react-hook-form';
import {Store} from '../../../redux/store';
import * as stateAction from '../../../redux/actions';
import SelectAudit from '../products/audits/selectedAudits';
import ExistingMaterials from '../products/materials/EditMaterials';
import GalleryScreen from '../products/gallery/existing';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FormData} from '../../../types/docType';
import SmallDivider from '../../../components/styles/SmallDivider';
import {useImageUpload} from '../../../hooks/utils/image/useImageUpload';
import SaveButton from '../../../components/ui/Button/SaveButton';
import {useUser} from '../../../providers/UserContext';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

interface EditProductFormProps {
  serviceIndex: number;
  quotationId: string;
  onClose: Function;
}

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const AddProductForm = ({
  serviceIndex,
  onClose,
  quotationId,
}: EditProductFormProps) => {
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    watch,
    setValue,
    formState: {isDirty},
  } = context;
  const serviceID = getValues('id');
  const user = useUser();
  //   const [qty, setQuantity] = useState(item.qty);
  //   const [unitPrice, setPrice] = useState(item.unitPrice);
  const {isImageUpload, imageUrl, handleLogoUpload} = useImageUpload();
  const [count, setCount] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalMaterialsVisible, setIsModalMaterialsVisible] = useState(false);
  const [isModalImagesVisible, setModalImagesVisible] = useState(false);
  const unitPrice = watch(`services[${serviceIndex}].unitPrice`);
  const qty = watch(`services[${serviceIndex}].qty`);
  const [serviceImages, setServiceImages] = useState<string[]>(
    watch(`services[${serviceIndex}].serviceImages`),
  );

  const createService = async (data: any) => {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/addNewService`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok.');
      }
    } catch (err) {
      console.error('Error in updateContractAndQuotation:', err);
      throw err;
    }
  };
  const totalCost = useMemo(
    () => (qty > 0 ? qty * unitPrice : 0),
    [qty, unitPrice],
  );
  const handleFormSubmit = (data: FormData) => {
    console.log('handle me');
  };
  const audits = watch(`services[${serviceIndex}].audits`);
  const materials = watch(`services[${serviceIndex}].materials`);
  // useMutation for upsertService
  const queryClient = useQueryClient();
  const {mutate, isLoading} = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardData']);
      onClose();
    },
    onError: (error: any) => {
      console.error('There was a problem calling the function:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication error. Please re-login.';
      } else if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }

      Alert.alert('Error', errorMessage);
    },
  });

  const isAuditsDisabled = useMemo(() => {
    return audits?.length > 0;
  }, [audits]);

  const isMaterialsDisabled = useMemo(() => {
    return materials?.length > 0;
  }, [materials]);

  const onGetValues = useCallback(() => {
    const serviceFormContxt = getValues(`services[${serviceIndex}]`);
    const companyId = getValues('services[0].companyId');
    const service = {
      ...serviceFormContxt,
      id:uuidv4(),
      qty: serviceFormContxt.qty ? parseInt(serviceFormContxt.qty ): 1,
      unit: serviceFormContxt.unit === 'none' ? 'ชุด' : serviceFormContxt.unit,
      audits: serviceFormContxt.audits?.map(audit => ({
        id: audit?.AuditData?.id,
      })),
      materials: serviceFormContxt.materials?.map(material => ({
        id: material?.materialData?.id,
      })),
    };
    console.log('modified service', JSON.stringify(service));
    mutate({service, quotationId,companyId});
  }, [getValues, serviceIndex]);

  useEffect(() => {
    const parsedUnitPrice = parseFloat(unitPrice) || 0;
    const parsedQty = parseInt(qty, 10) || 0;
    const total = parsedUnitPrice * parsedQty;
    setValue(`services[${serviceIndex}].total`, total.toString(), {
      shouldDirty: true,
    });
    setValue(`services[${serviceIndex}].serviceImages`, serviceImages, {
      shouldDirty: true,
    });
  }, [unitPrice, qty, serviceIndex, setValue, serviceImages]);

  if (isLoading) {
    return (
      <ActivityIndicator
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        size="large"
      />
    );
  }
  console.log('values', getValues('services[0].companyId'));

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onClose()}>
            <FontAwesomeIcon icon={faClose} size={24} color="gray" />
          </TouchableOpacity>
        </View>
        <View style={styles.subContainer}>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {isImageUpload ? (
              <ActivityIndicator size="small" color="#0073BA" />
            ) : (
              <FlatList
                data={serviceImages}
                horizontal={true}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.imageContainer}>
                      <TouchableOpacity
                        onPress={() => setModalImagesVisible(true)}>
                        <Image source={{uri: item}} style={styles.image} />
                      </TouchableOpacity>
                    </View>
                  );
                }}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={
                  serviceImages?.length > 0 ? (
                    <TouchableOpacity
                      style={styles.addButtonContainer}
                      onPress={() => {
                        setModalImagesVisible(true);
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
                ListEmptyComponent={
                  <View>
                    <TouchableOpacity
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 20,
                        borderColor: '#0073BA',
                        borderWidth: imageUrl == null ? 1 : 0,
                        borderRadius: 5,
                        borderStyle: 'dashed',
                        // marginHorizontal: 100,
                        padding: 10,
                        height: imageUrl == null ? 100 : 150,
                        width: imageUrl == null ? 200 : 'auto',
                      }}
                      onPress={() => {
                        setModalImagesVisible(true);

                        // navigation.navigate('GalleryScreen', {code});
                      }}>
                      <FontAwesomeIcon
                        icon={faImages}
                        style={{marginVertical: 5, marginHorizontal: 50}}
                        size={32}
                        color="#0073BA"
                      />
                      <Text
                        style={{
                          textAlign: 'center',
                          color: '#0073BA',
                          fontFamily: 'Sukhumvit set',
                        }}>
                        เลือกภาพตัวอย่างผลงาน
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}
            
          </View>
          <Text style={styles.priceTitle}>ชื่อรายการ</Text>
          <Controller
            control={control}
            name={`services[${serviceIndex}].title`}
            render={({field: {onChange, value}}) => (
              <TextInput
                placeholder="ชื่อสินค้า-บริการ.."
                style={styles.inputName}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Text style={styles.priceTitle}>รายละเอียด</Text>

          <Controller
            control={control}
            name={`services[${serviceIndex}].description`}
            render={({field: {onChange, value}}) => (
              <TextInput
                placeholder="รายละเอียด..."
                keyboardType="name-phone-pad"
                multiline
                textAlignVertical="top"
                numberOfLines={4}
                style={styles.inputAddress}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <View style={styles.summary}>
            <Text style={styles.priceHead}>ราคา:</Text>
            <Controller
              control={control}
              name={`services[${serviceIndex}].unitPrice`}
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={[styles.input, {textAlign: 'right'}]}
                  placeholder="0"
                  keyboardType="number-pad"
                  onChangeText={value => {
                    onChange(value);
                  }}
                  value={value}
                />
              )}
            />
          </View>
          <View style={styles.summary}>
            <Text style={styles.price}>จำนวน:</Text>

            {/* START COUNTER BUTTON */}
            <View style={styles.containerCounter}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  const currentCount =
                    parseInt(getValues(`services[${serviceIndex}].qty`), 10) ||
                    1;
                  if (currentCount > 0) {
                    setValue(
                      `services[${serviceIndex}].qty`,
                      currentCount - 1,
                      {shouldDirty: true},
                    );
                  }
                }}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>

              <Controller
                control={control}
                name={`services[${serviceIndex}].qty`}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={styles.counter}
                    placeholder="1"
                    keyboardType="number-pad"
                    onChangeText={text => {
                      const newValue = text === '' ? 0 : parseInt(text, 10);
                      if (!isNaN(newValue)) {
                        onChange(newValue);
                      }
                    }}
                    value={value?.toString() || 1}
                  />
                )}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  const currentCount =
                    parseInt(getValues(`services[${serviceIndex}].qty`), 10) ||
                    0;
                  setValue(`services[${serviceIndex}].qty`, currentCount + 1);
                }}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* END COUNTER BUTTON */}
          </View>
          <View style={styles.summary}>
            <Text style={styles.price}>หน่วย:</Text>
            <Controller
              control={control}
              name={`services[${serviceIndex}].unit`}
              defaultValue="ชุด"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={styles.price}
                  keyboardType="default"
                  onChangeText={onChange}
                  value={value && value !== 'none' ? value : 'ชุด'}
                />
              )}
            />
          </View>
          <SmallDivider />
          <View style={styles.summary}>
            <Text style={styles.priceSum}>รวมเป็นเงิน:</Text>
            <Controller
              control={control}
              name={`services[${serviceIndex}].total`}
              defaultValue=""
              render={({field: {value}}) => (
                <Text style={styles.priceSummary}>{Number(value) .toFixed(2)
                  .replace(/\d(?=(\d{3})+\.)/g, '$&,') || '0'}</Text>
              )}
            />
          </View>
          <View
            style={{
              ...Platform.select({
                ios: {
                  paddingVertical: 10,
                },
                android: {
                  paddingVertical: 0,
                },
              }),
            }}></View>
          <SmallDivider />

          <View>
            {isAuditsDisabled ? (
              <View style={styles.cardContainer}>
                <Text
                  style={{
                    marginBottom: 5,
                    marginTop: 20,
                    fontFamily: 'Sukhumvit Set Bold',
                    fontWeight: 'bold',

                    fontSize: 16,

                    color: '#333',
                  }}>
                  มาตรฐานของบริการนี้:
                </Text>
                {audits.map((item: any) => (
                  <TouchableOpacity
                    key={item.AuditData.id}
                    style={styles.card}
                    onPress={() => setModalVisible(true)}>
                    <Text style={styles.cardTitle}>
                      {item.AuditData.auditShowTitle}
                    </Text>
                    <Icon name="chevron-right" size={24} color="gray" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setModalVisible(true)}>
                <View style={styles.containerButton}>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    color="#0073BA"
                    size={14}
                  />
                  <Text style={styles.selectButtonText}>
                    เลือกมาตรฐานการทำงาน
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              ...Platform.select({
                ios: {
                  paddingVertical: 10,
                },
                android: {
                  paddingVertical: 10,
                },
              }),
            }}></View>
          <SmallDivider />
          <View>
            {isMaterialsDisabled ? (
              <View style={styles.cardContainer}>
                <Text
                  style={{
                    marginBottom: 5,
                    marginTop: 20,
                    fontSize: 16,
                    fontFamily: 'Sukhumvit Set Bold',
                    fontWeight: 'bold',
                    color: '#333',
                  }}>
                  วัสดุอุปกรณ์ที่ใช้
                </Text>
                {materials.map((item: any, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.card}
                    onPress={() => setIsModalMaterialsVisible(true)}>
                    <Text style={styles.cardTitle}>
                      {item.materialData.name}
                    </Text>
                    <Icon name="chevron-right" size={24} color="gray" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setIsModalMaterialsVisible(true)}>
                  <View style={styles.containerButton}>
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      color="#0073BA"
                      size={14}
                    />

                    <Text style={styles.selectButtonText}>
                      เลือกวัสดุอุปกรณ์
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View
            style={{
              ...Platform.select({
                ios: {
                  paddingVertical: 10,
                },
                android: {
                  paddingVertical: 10,
                },
              }),
            }}></View>
          <SmallDivider />
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <SaveButton
              disabled={!isAuditsDisabled}
              onPress={onGetValues} 
            />
          </View>
        </View>
        <SelectAudit
          isVisible={isModalVisible}
          serviceIndex={serviceIndex}
          onClose={() => setModalVisible(false)}
          title={watch(`services[${serviceIndex}].title`)}
          description={watch(`services[${serviceIndex}].description`)}
        />
        <ExistingMaterials
          serviceIndex={serviceIndex}
          isVisible={isModalMaterialsVisible}
          onClose={() => setIsModalMaterialsVisible(false)}
        />
        <GalleryScreen
          isVisible={isModalImagesVisible}
          onClose={() => setModalImagesVisible(false)}
          serviceImages={serviceImages}
          setServiceImages={setServiceImages}
        />
      </ScrollView>
    </>
  );
};
export default AddProductForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 0,
    height: 'auto',
    width: '100%',
  },
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 30,
    marginBottom: 10,
  },

  form: {
    border: '1px solid #0073BA',
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
    fontWeight: 'bold',

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
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
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
  priceSummary: {
    fontSize: 18,
    marginTop: -10,
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  price: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceSum: {
    fontSize: 18,
    
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',

  },
  priceHead: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceTitle: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    marginTop: 5,
    fontFamily: 'Sukhumvit Set Bold',
  },
  counter: {
    fontSize: 16,
    paddingHorizontal: 20,
  },
  containerCounter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#e9f4f9',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectButton: {
    // backgroundColor: '#0073BA',
    backgroundColor: 'white',
    borderColor: '#0073BA',
    borderWidth: 1,
    borderStyle: 'dotted',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
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
    fontFamily: 'Sukhumvit set',
    marginLeft: 10,
  },
  btnDisabled: {
    backgroundColor: '#ccc',
  },

  count: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginTop: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    marginTop: 0,
    paddingHorizontal: 20,
    paddingVertical: 5,
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
    marginTop: 5,
  },
  headingRight: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: '#397af8',
  },
});
