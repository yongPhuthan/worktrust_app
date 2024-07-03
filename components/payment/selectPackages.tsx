import React, {useContext, useState} from 'react';
import {SLIPOK_API_KEY, SLIPOK_BRANCH_ID, BACK_END_SERVER_URL} from '@env';
import ConfettiCannon from 'react-native-confetti-cannon';

import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  Appbar,
  Button,
  Chip,
  Divider,
  IconButton,
  RadioButton,
  Text,
  Badge,
} from 'react-native-paper';
import {useForm, useWatch} from 'react-hook-form';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Store} from '../../redux/store';
import {usePickImage} from '../../hooks/utils/image/usePickImage';
import {useCreateToServer} from '../../hooks/useUploadToserver';
import UploadImage from '../../components/ui/UploadImage';
import {useUploadSlipToFirebase} from '../../hooks/utils/image/useUploadSlip';
import Clipboard from '@react-native-clipboard/clipboard';

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
}
interface Packages {
  id: string;
  name: string;
  price: string;
  pricePerMonth: string;
  save: string;
}

interface SelectPackagesData {
  selectedPackage: Packages | null;
  paymentSlip: string | null;
  companyId: string;
}
const PRIMARY_COLOR = '#00a69c';
const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const SelectPackages = ({isVisible, onClose}: ExistingModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCheckingSlip, setIsCheckingSlip] = useState(false);
  const packages = [
    {
      id: '1',
      name: '1 เดือน',
      price: '999',
      pricePerMonth: '999',
      save: '0',
    },
    // {
    //   id: '6',
    //   name: '6 เดือน',
    //   // price: '2',
    //   price: '5,399',
    //   pricePerMonth: '899',
    //   save: '595',
    // },
    {
      id: '12',
      name: '12 เดือน',
      // price: '3',
      price: '9,990',
      pricePerMonth: '832',
      save: '1,998',
    },
  ];

  const {
    state: {companyId},
    dispatch,
  } = useContext(Store);
  const {
    isUploading,
    error: uploadError,
    uploadSlip,
  } = useUploadSlipToFirebase();
  const {control, setValue, reset} = useForm<SelectPackagesData>({
    mode: 'onChange',
    defaultValues: {
      paymentSlip: null,
      selectedPackage: packages[2],
      companyId,
    },
  });

  const {isImagePicking, pickImage} = usePickImage((uri: string) => {
    setValue('paymentSlip', uri, {shouldDirty: true});
  });

  const selectedPackage = useWatch({
    control,
    name: 'selectedPackage',
  });

  const paymentSlip = useWatch({
    control,
    name: 'paymentSlip',
  });

  const checkSlip = async () => {
    setIsCheckingSlip(true);

    if (!selectedPackage) {
      Alert.alert('โปรดเลือกแพคเกจที่ต้องการชำระ');
      return;
    }
    if (!paymentSlip) {
      Alert.alert('โปรดอัพโหลดสลิปการโอนเงิน');
      return;
    }
    try {
      const uploadImage = await uploadSlip(paymentSlip);

      if (!uploadImage.originalUrl) {
        Alert.alert('เกิดข้อผิดพลาดในการอัพโหลดสลิป กรุณาลองใหม่อีกครั้ง  ');
        return;
      }

      const response = await fetch(
        `https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-authorization': SLIPOK_API_KEY,
          },
          body: JSON.stringify({
            // url: 'https://firebasestorage.googleapis.com/v0/b/worktrust-b9c02.appspot.com/o/slip%2FIMG_8F0AD19BD6FA-1.jpeg?alt=media&token=81371615-95ce-4b7b-b8e7-0a32dfa7a5b1',
            log: true,
            url: uploadImage.originalUrl,
            amount: selectedPackage.price,
          }),
        },
      );

      if (!response.ok) {
        // Handle invalid slip
        const errorData = await response.json();
        console.log(errorData.code); // Check error code
        console.log(errorData.message); // Check error message
        Alert.alert(errorData.message, 'กรุณาลองใหม่อีกครั้ง', [
          {
            text: 'ตกลง',
            style: 'cancel',
          },
        ]);
        return;
      }

      // Handle success slip
      const slipData = await response.json();
      const success = await createToServer(selectedPackage.id);
      if (success) {
        setShowConfetti(true);
        Alert.alert(
          'ชำระเงินสำเร็จ!',
          `แพคเกจปัจจุบันของคุณคือ ${selectedPackage.name}`,
          [
            {
              text: 'ตกลง',
              onPress: () => {
                setShowConfetti(false);
                reset();
                onClose();
              },
            },
          ],
        );
      } else {
        Alert.alert('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsCheckingSlip(false);
    }
  };
  const url = `${BACK_END_SERVER_URL}/api/company/createSubscriptionPlan`;

  const {isLoading, error, createToServer} = useCreateToServer(
    url,
    'dashboardData',
  );
  const handleConfirmPayment = () => {
    // Function to handle confirming the payment
    if (!selectedPackage) {
      alert('กรุณาเลือกแพคเกจ');
      return;
    }
    const selectedPackageDetails = packages.find(
      pkg => pkg.name === selectedPackage.name,
    );
    if (selectedPackageDetails && paymentSlip) {
      checkSlip();
    } else {
      alert('กรุณาเลือกแพคเกจและอัพโหลดสลิปการโอนเงิน');
    }
  };
  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={onClose} />

        <Appbar.Content title="เลือกแพคเกจ" titleStyle={{fontSize: 18}} />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            marginBottom: 100,
          }}>
          {packages.map((item, index) => (
            <View key={item.id}>
              <View style={[styles.card]}>
                <RadioButton.Android
                  value={item.name}
                  status={
                    selectedPackage?.name === item.name
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() =>
                    setValue('selectedPackage', item, {shouldDirty: true})
                  }
                  color={PRIMARY_COLOR}
                />
                <View style={styles.textContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    <Text style={styles.price}>{item.name}</Text>
                  </View>

                  {index !== 0 && (
                    <View
                      style={{
                        flexDirection: 'column',
                        marginBottom: 5,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: 10,
                        }}>
                        <Text style={styles.discount}>{item.price} บาท</Text>
                        {index !== 0 && (
                          <Chip
                            children={<Text>ประหยัด {item.save} บาท</Text>}
                          />
                        )}
                      </View>
                      <Text style={styles.description}>
                        ชำระ {item.price} บาท
                      </Text>
                    </View>
                  )}
                  <Text style={styles.productTitle}>
                    {item.pricePerMonth} บาท / เดือน
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
            </View>
          ))}
          <View
            style={{
              padding: 16,
            }}>
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
                marginBottom: 20,
                borderRadius: 5,
                padding: 10,
                justifyContent: 'space-between',
                backgroundColor: '#f2f7f1',
              }}>
              <View
                style={{
                  flexDirection: 'row',

                  justifyContent: 'flex-start',
                  backgroundColor: '#f2f7f1',
                  gap: 5,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    // fontWeight: 'bold',
                  }}>
                  ยอดชำระ
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    // fontWeight: 'bold',
                  }}>
                  {selectedPackage?.price} บาท
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                }}>
                ได้รับ {selectedPackage?.name}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#e7f0fe',
                flexDirection: 'row',
                padding: 10,
                paddingVertical: 20,
                gap: 10,
                borderRadius: 5,
              }}>
              <Image
                source={require('../../assets/images/kbank.jpg')}
                style={{
                  width: 50,
                  height: 50,
                  margin: 10,
                  borderRadius: 10,
                }}
              />
              <View
                style={{
                  flexDirection: 'column',
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    gap: 5,

                    alignItems: 'flex-start',
                  }}>
                  <Text>ธนาคารกสิกรไทย </Text>
                  <Text
                    style={{
                      fontSize: 12,
                    }}>
                    สาขา บิ๊กซีอ้อมใหญ่
                  </Text>
                  <Text>หจก สยามเซฟตี้เอ็นจิเนียริ่ง (กรุ๊ป) </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'column',
                    gap: 5,
                    alignItems: 'flex-start',
                    marginVertical: 5,
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#00674a',
                    }}>
                    เลขที่ 123-4-56789-0
                  </Text>
                  {/* {copied && (
              <Badge  style={styles.badge}>copied</Badge>
            )}
                  <IconButton
                    icon="content-copy"
        
                    size={14}
                    onPress={() => copyToClipboard(accountNumber)}

                  />
                   */}
                </View>
              </View>
            </View>
            <View
              style={{
                paddingTop: 20,
                width: '50%',
                flexDirection: 'column',
                gap: 15,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: 'black',
                  fontWeight: 'bold',
                }}>
                สลิปโอนเงิน
              </Text>
              <UploadImage
                control={control}
                name="paymentSlip"
                label="อัพโหลดสลิปโอนเงิน"
                isUploading={isImagePicking}
                pickImage={pickImage}
                width={150}
                height={150}
              />
            </View>
            <Button
              loading={isLoading || isCheckingSlip}
              disabled={isLoading || isCheckingSlip}
              mode="contained"
              style={{
                borderRadius: 5,
                padding: 5,
                width: '100%',
                marginTop: 40,
              }}
              onPress={handleConfirmPayment}>
              <Text style={styles.saveText}>แจ้งชำระเงิน</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{x: -10, y: 0}}
          fallSpeed={2000}
          fadeOut
          autoStart
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#F7F7F7',
    width,
  },
  titleText: {
    fontSize: 16,
    //   fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
  },
  emptyListButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginTop: 20,
  },
  modalCreate: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#012b20',
    // backgroundColor: '#0073BA',
    alignItems: 'center',
    justifyContent: 'center',

    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  divider: {
    maxWidth: width * 0.8,
    width: '100%',
    alignSelf: 'center',
  },
  saveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  imageContainer: {
    width: imageContainerWidth,
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
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
  addNewButton: {
    width: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: '#012b20',

    height: 50,

    borderRadius: 5,
  },

  closeButton: {
    paddingVertical: 10,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 10,

    backgroundColor: '#f5f5f5',
  },

  selected: {
    backgroundColor: '#F2F2F2',
  },
  price: {
    fontSize: 14,
    // color: PRIMARY_COLOR,
    marginVertical: 4,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    height: height * 0.5,
    alignItems: 'center',
    paddingBottom: 100,
    marginBottom: 100,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginVertical: 8,
    gap: 10,

    width: width - 32, // Adjust based on your padding
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'gray',
    color: 'white',
  },
  cardChecked: {
    borderColor: '#012b20', // Color when checked
  },
  checkboxContainer: {
    padding: 0,
    margin: 0,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 14,
    color: '#047e6e',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    // color: 'gray',
  },
  discount: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    // color: 'gray',
  },
  productImage: {
    width: 100, // Adjust the size according to your design
    height: 100, // Adjust the size according to your design
    borderRadius: 4, // If you want rounded corners
  },
  addNewText: {
    color: '#012b20',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  icon: {
    color: '#012b20',
  },
});

export default SelectPackages;
