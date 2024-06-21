import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    Appbar,
    Avatar,
    Divider,
    IconButton
} from 'react-native-paper';

import {
    ServicesEmbed,
    Submissions
} from '@prisma/client';
import SubmissionViewScreen from '../../components/webview/submission';
import useSelectedDates from '../../hooks/quotation/create/useSelectDates';
import { Store } from '../../redux/store';
import { ParamListBase } from '../../types/navigationType';
type Props = {
  navigation: StackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, 'ViewSubmission'>;
};

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const width = Dimensions.get('window').width;

const ViewSubmission = (props: Props) => {
  const {route, navigation} = props;
  const {
    initialDateOfferFormatted,

    initialDateOffer,
  } = useSelectedDates();
  const {
    state: {
      viewSubmission,
      quotationId,
    },
    dispatch,
  } = useContext(Store);
  if(!viewSubmission){
    Alert.alert('ไม่พบข้อมูลงานที่ส่ง');  
    navigation.goBack();
  }
  const [dateOfferFormatted, setDateOfferFormatted] = useState<string>(
    initialDateOfferFormatted,
  );
  const [submissionServerId, setSubmissionServerId] = useState<string | null>(
    null,
  );

  const url = `https://www.worktrust.co/submission/${submissionServerId}`;

  const [opneSubmissionModal, setOpenSubmissionModal] =
    useState<boolean>(false);


  const methods = useForm<Submissions>({
    mode: 'all',
    defaultValues: viewSubmission || {},
  });
  const beforeImages = useWatch({
    control: methods.control,
    name: 'beforeImages',
  });
  const dateOffer = useWatch({control: methods.control, name: 'dateOffer'});
  const afterImages = useWatch({control: methods.control, name: 'afterImages'});
  const address = useWatch({control: methods.control, name: 'address'});
  const description = useWatch({control: methods.control, name: 'description'});
  const services = useWatch({control: methods.control, name: 'services'});

  const removeService = (index: number) => {
    const updatedServices = services.filter((_: any, i: number) => i !== index);
    methods.setValue('services', updatedServices, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
const quotationRefNumber = useWatch({
    control: methods.control,
    name: 'quotationRefNumber',
  });

  const customerName = useWatch({
    control: methods.control,
    name: 'customer.name',
  });
const workers = useWatch({
    control: methods.control,
    name: 'workers',
  });
  return (
    <>
      <FormProvider {...methods}>
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
          <Appbar.Content  title="รายละเอียดงานที่ส่ง" titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
          }} />
          <IconButton
              mode="outlined"
              icon="web"
           
              onPress={() => setOpenSubmissionModal(true)}
            />
        </Appbar.Header>
        <KeyboardAwareScrollView>
          <ScrollView
            style={{
              backgroundColor: '#FFFFFF',
              marginBottom: 100,
              paddingHorizontal: 20,
            }}>
            <View style={styles.card}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',

                  marginVertical: 15,
                  alignContent: 'center',
                }}>
                <Text style={styles.title}>ใบเสนอราคาเลขที่</Text>
                <Text>{ quotationRefNumber}</Text>
              </View>
              <Divider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',

                  marginVertical: 15,
                  alignContent: 'center',
                }}>
                <Text style={styles.title}>ลูกค้า </Text>
                <Text>{customerName}</Text>
              </View>
            </View>

            <View style={styles.stepContainer} />
            <Divider />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              
              }}>
              <Text style={styles.titleDate}>วันที่แจ้งส่งงาน</Text>
              <Text>{thaiDateFormatter.format(new Date(dateOffer))}</Text>

            </View>

            <Divider />
            <View style={{ alignItems:'center', justifyContent:'space-between',marginVertical: 20, flexDirection:'row'}}>
              <Text style={styles.title}>หนังสือส่งงานทำขึ้นที่</Text>
            <Text >
                {address}
            </Text>
            </View>
            <Divider style={{marginBottom: 20}} />

            <View>
              <Text style={styles.title}>งานที่แจ้งส่ง</Text>
              {services.map((service: ServicesEmbed, index: number) => (
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'space-between',
                    maxWidth: width * 0.75,
                    gap: 10,
                  }}
                  key={index}>
                  <View>
                    <Text style={styles.listTitle}>
                      {index + 1}. {service.title}
                    </Text>
                    <Text style={styles.listDescription}>
                      {service.description}
                    </Text>
                  </View>

              
                </View>
              ))}
            </View>

            <Divider style={{marginVertical: 20}} />

            <View>
              {workers.length > 0 && (
                <View>
                  <Text style={styles.title}>พนักงานติดตั้ง</Text>
                  <FlatList
                    data={workers}
                    horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <View style={styles.workers}>
                          <Avatar.Image
                            size={100}
                            source={{uri: item.image ? item.image : ''}}
                          />

                          <Text>{item.name}</Text>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </View>
              )}
            </View>
            <Divider style={{marginVertical: 20}} />
            <View>
              <Text style={styles.title}>รูปก่อนทำงาน</Text>
              <FlatList
                data={beforeImages}
                horizontal={true}
                renderItem={({item, index}) => (
                  <View key={index} style={styles.imageContainer}>
                  <Image
                        source={{uri: item.thumbnailUrl}}
                        style={styles.image}
                      />
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              
              />
            </View>
            <Divider style={{marginVertical: 10}} />
            <View>
              <Text style={styles.title}>รูปหลังทำงาน</Text>
              <FlatList
                data={afterImages}
                horizontal={true}
                renderItem={({item, index}) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                        source={{uri: item.thumbnailUrl}}
                        style={styles.image}
                      />
                   
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
               
              />
            </View>
            <Divider style={{marginVertical: 10}} />

            <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
              <Text style={styles.title}>รายละเอียดงานที่ส่ง</Text>
              <Text style={{marginTop:15}}>
              {description}</Text>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <SubmissionViewScreen
              fileName={customerName}
              visible={opneSubmissionModal}
              onClose={() => setOpenSubmissionModal(false)}
              url={url}
            />
       
      </FormProvider>
    </>
  );
};

export default ViewSubmission;

const styles = StyleSheet.create({
  containerForm: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
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
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  formInput: {
    flex: 1,
    marginTop: 5,
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
    marginTop: 10,
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
  label: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 10,
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

    marginTop: 20,

    flexDirection: 'column',
    margin: 5,
  },
  workers: {
    flexDirection: 'column',
    marginTop: 20,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
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
    fontSize: 14,
    marginTop: 20,
  },
  listDescription: {
    fontSize: 12,
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
