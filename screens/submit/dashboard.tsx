import {BACK_END_SERVER_URL} from '@env';
import messaging from '@react-native-firebase/messaging';
import {DrawerActions} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';

import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {QuotationsFilterButton} from '../../components/ui/Dashboard/FilterButton'; // Adjust the import path as necessary
import firebase from '../../firebase';
import {useActiveFilter} from '../../hooks/dashboard/useActiveFilter';
import {
  useFilteredData,
  useFilteredInvoicesData,
} from '../../hooks/dashboard/useFilteredData';
import CardDashBoard from '../../components/CardDashBoard';
import {useUser} from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';

import {DashboardScreenProps} from '../../types/navigationType';

import {
  ActivityIndicator,
  Appbar,
  Dialog,
  Divider,
  FAB,
  List,
  PaperProvider,
  Icon,
  Portal,
} from 'react-native-paper';
import {requestNotifications} from 'react-native-permissions';
import useFetchDashboard from '../../hooks/submission/useFetchDashboard'; // adjust the path as needed

import ProjectModalScreen from '../../components/webview/project';
import {useModal} from '../../hooks/quotation/create/useModal';
import PDFModalScreen from '../../components/webview/pdf';
import {
  Company,
  CustomerEmbed,
  QuotationStatus,
  Quotations,
  ServicesEmbed,
} from '@prisma/client';
import {CompanyState} from 'types';
import useResetQuotation from '../../hooks/quotation/update/resetStatus';
interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}
const Dashboard = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(true);
  const user = useUser();
  const {
    openModal: openPDFModal,
    closeModal: closePDFModal,
    isVisible: showPDFModal,
  } = useModal();
  const {
    openModal: openProjectModal,
    closeModal: closeProjectModal,
    isVisible: showProjectModal,
  } = useModal();
  const {
    dispatch,
    state: {code},
  }: any = useContext(Store);
  const {data, isLoading, isError, error} = useFetchDashboard();
  const {activeFilter, updateActiveFilter} = useActiveFilter();
  const {width, height} = Dimensions.get('window');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const queryClient = useQueryClient();
  const [isModalSignContract, setIsModalSignContract] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Quotations | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<Quotations[] | null>(null);
  const filteredData = useFilteredData(
    originalData,
    activeFilter as QuotationStatus,
  );
  const [companyData, setCompanyData] = useState<CompanyState | null>(null);
  const [quotationData, setQuotationData] = useState<Quotations[] | null>(null);
  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{name: 'FirstAppScreen'}],
      });
    } catch (error) {
      console.error('Failed to sign out: ', error);
    }
  };
  const handleErrorResponse = (error: ErrorResponse) => {
    switch (error.message) {
      case 'logout':
        handleLogout();
        break;
      case 'redirectToCreateCompany':
        navigation.navigate('CreateCompanyScreen');
        break;
      case 'retry':
        console.log('Retrying...');
        // Implement retry logic here if necessary
        break;
      default:
        console.error('Unhandled error action:', error.message);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const {status} = await requestNotifications(['alert', 'badge', 'sound']);
      console.log('Notification permission request status:', status);
    } catch (error) {
      console.error('Error requesting notifications permission:', error);
    }
  };

  const removeQuotation = async (id: string) => {
    handleModalClose();
    setIsLoadingAction(true);
    if (!user || !user.uid) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/docs/deleteQuotation?id=${encodeURIComponent(
          id,
        )}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        queryClient.invalidateQueries({
          queryKey: ['dashboardData'],
        });
        setIsLoadingAction(false);
      } else {
        // It's good practice to handle HTTP error statuses
        const errorResponse = await response.text(); // or response.json() if the server responds with JSON
        console.error('Failed to delete quotation:', errorResponse);
        setIsLoadingAction(false);
        // Display a more specific error message if possible
        Alert.alert('Error', 'Failed to delete quotation. Please try again.');
      }
    } catch (err) {
      console.error('An error occurred:', err);
      setIsLoadingAction(false);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบใบเสนอราคาได้');
    }
  };

  const confirmRemoveQuotation = (id: string, customer: CustomerEmbed) => {
    setShowModal(false);
    Alert.alert(
      'ยืนยันลบเอกสาร',
      `ลูกค้า ${customer}`,
      [
        {
          text: 'ยกเลิก',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'ลบเอกสาร', onPress: () => removeQuotation(id)},
      ],
      {cancelable: false},
    );
  };

  const {mutate: resetStatus, isPending: isReseting} = useResetQuotation();
  const confirmResetQuotation = (id: string, customerName: string) => {
    setShowModal(false);
    Alert.alert(
      'ยืนยันการรีเซ็ตสถานะ',
      `ลูกค้า ${customerName}`,
      [
        {
          text: 'ยกเลิก',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'รีเซ็ต', onPress: () => resetStatus(id)},
      ],
      {cancelable: false},
    );
  };

  useEffect(() => {
    if (data) {
      // If data[0] exists and has a non-null `code`, proceed with your logic
      const companyWithoutQuotations = {
        ...data.company,
        quotations: [],
      };
      setCompanyData(companyWithoutQuotations);
      setQuotationData(data.company.quotations);
      setOriginalData(data.company.quotations);
    }
  }, [data]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);
  useEffect(() => {
    if (user) {
      console.log('User:', user);

      const unsubscribe = messaging().setBackgroundMessageHandler(
        async remoteMessage => {
          console.log('Message handled in the background!', remoteMessage);
        },
      );

      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    // ใช้ useEffect เพื่อตรวจสอบการเปลี่ยนแปลงของ showProjectModal และ showPDFModal
    // และทำการเปลี่ยนแปลงค่าของ showModal ให้เป็น false เพื่อปิด Modal
    // ที่เปิดอยู่ก่อนหน้านี้
    if (showProjectModal || showPDFModal) {
      setShowModal(false);
    }
  }, [showProjectModal, showPDFModal]);

  const filtersToShow = [
    QuotationStatus.ALL,
    QuotationStatus.SUBMITTED,
    QuotationStatus.CUSTOMER_APPROVED,
    QuotationStatus.CUSTOMER_REJECTED,
    QuotationStatus.CUSTOMER_REVIEWED,
  ];
  const handleModalOpen = (item: Quotations, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    // handleModal(item, index);
    setShowModal(true);
  };

  const handleModalClose = () => {
    // setSelectedItem(null);
    setSelectedIndex(null);
    setShowModal(false);
  };
  const editQuotation = async (
    services: ServicesEmbed[],
    quotation: Quotations,
  ) => {
    setIsLoadingAction(true);
    dispatch(stateAction.get_companyID(data?.company?.id as string));
    dispatch(stateAction.get_edit_quotation(quotation));
    setIsLoadingAction(false);
    handleModalClose();
    navigation.navigate('CreateQuotation');

    // navigation.navigate('EditQuotation', {
    //   quotation,
    //   company: data[0],
    //   services,
    // });
  };

  if (isError && error) {
    handleErrorResponse(error);
  }

  const renderItem = ({item, index}: any) => (
    <>
      <View style={{marginTop: 10}}>
        <CardDashBoard
          status={item.status}
          date={item.dateOffer}
          end={item.dateEnd}
          price={item.allTotal}
          customerName={item.customer?.name as string}
          // onCardPress={()=>handleModal(item, index)}
          onCardPress={() => handleModalOpen(item, index)}
        />
      </View>

      {selectedItem && selectedIndex === index && (
        <>
          <Portal>
            <PaperProvider>
              <Modal
                backdropOpacity={0.1}
                backdropTransitionOutTiming={100}
                onBackdropPress={handleModalClose}
                isVisible={showModal}
                style={styles.modalContainer}
                onDismiss={handleModalClose}>
                <List.Section
                  style={{
                    width: '100%',
                  }}>
                  <List.Subheader
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontFamily: 'Sukhumvit Set Bold',
                      color: 'gray',
                    }}>
                    {item.customer?.name}
                  </List.Subheader>
                  <Divider />
                  {/* <List.Item
                    onPress={() => {
                      handleModalClose();
                      navigation.navigate('ProjectViewScreen', {
                        id: item.id,
                        pdfUrl: item.pdfUrl,

                        fileName: `ใบเสนอราคา ${item.customer.name}.pdf`,
                      });
                    }}
                    centered={true}
                    title="พรีวิวเอกสาร"
                    titleStyle={{textAlign: 'center', color: 'black'}}
                  />

                  <Divider /> */}
                  {/* <List.Item
                    onPress={() => {
                      handleModalClose();
                      navigation.navigate('PDFViewScreen', {
                        pdfUrl: item.pdfUrl,

                        fileName: `ใบเสนอราคา ${item.customer.name}.pdf`,
                      });
                    }}
                    title="เอกสาร PDF"
                    titleStyle={{textAlign: 'center'}}
                  />

                  <Divider /> */}

                  {selectedItem?.status === QuotationStatus.SUBMITTED && (
                    <>
                      <List.Item
                        onPress={() => {
                          setShowModal(false);
                          editQuotation(selectedItem.services, selectedItem);
                        }}
                        title="แก้ไข"
                        titleStyle={{textAlign: 'center', color: 'black'}}
                      />
                    </>
                  )}

                  {selectedItem?.status ===
                    QuotationStatus.CUSTOMER_REJECTED && (
                    <>
                      <Divider />
                      <List.Item
                        onPress={() => {}}
                        centered={true}
                        title="ดูรายละเอียด"
                        titleStyle={{textAlign: 'center', color: 'black'}}
                      />
                    </>
                  )}
                  {selectedItem?.status ===
                    QuotationStatus.CUSTOMER_REVIEWED && (
                    <>
                      <Divider />
                      <List.Item
                        onPress={() => {}}
                        centered={true}
                        title="ดูความคิดเห็น"
                        titleStyle={{textAlign: 'center', color: 'black'}}
                      />
                    </>
                  )}
                  {selectedItem?.status === QuotationStatus.CUSTOMER_APPROVED &&
                    QuotationStatus.CUSTOMER_REVIEWED && (
                      <>
                        <Divider />
                        <List.Item
                          onPress={() => {}}
                          centered={true}
                          title="ส่งใบรับประกัน"
                          titleStyle={{textAlign: 'center', color: 'black'}}
                        />
                        <Divider />
                        <List.Item
                          onPress={() => {}}
                          centered={true}
                          title="ส่งใบเสร็จรับเงิน"
                          titleStyle={{textAlign: 'center', color: 'black'}}
                        />
                      </>
                    )}
                  <Divider />
                  <List.Item
                    onPress={() =>
                      confirmResetQuotation(
                        item.id,
                        selectedItem?.customer?.name,
                      )
                    }
                    centered={true}
                    title="รีเซ็ต"
                    titleStyle={{textAlign: 'center', color: 'black'}}
                  />
                  <Divider />
                  <List.Item
                    onPress={() => {
                      dispatch(stateAction.get_edit_quotation(selectedItem));
                      setShowModal(false);
                      navigation.navigate('SendWorks');
                    }}
                    title={
                      selectedItem?.status === QuotationStatus.SUBMITTED
                        ? 'ส่งงานอีกครั้ง'
                        : 'แจ้งส่งงาน'
                    }
                    titleStyle={{textAlign: 'center'}}
                  />
                  <Divider />
                  {QuotationStatus.SUBMITTED && (
                    <List.Item
                      onPress={() =>
                        confirmRemoveQuotation(item.id, item?.customer?.name)
                      }
                      title="ลบ"
                      titleStyle={{textAlign: 'center', color: 'red'}}
                    />
                  )}
                </List.Section>
              </Modal>
            </PaperProvider>
          </Portal>
        </>
      )}
    </>
  );
  return (
    <>
      <PaperProvider>
        <Portal>
          <Appbar.Header
            // elevated
            mode="center-aligned"
            style={{
              backgroundColor: 'white',
            }}>
            <Appbar.Action
              icon={'menu'}
              onPress={() => {
                navigation.dispatch(DrawerActions.openDrawer());
              }}
            />
            <Appbar.Content
              title={'งานที่แจ้งส่ง '}
              titleStyle={{
                fontSize: 18,
                fontWeight: 'bold',
              }}
            />
          </Appbar.Header>
          {isLoadingAction ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator color="primary" />
            </View>
          ) : (
            <>
              <View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={filtersToShow}
                  renderItem={({item}) => (
                    <QuotationsFilterButton
                      filter={item}
                      isActive={item === activeFilter}
                      onPress={() => {
                        updateActiveFilter(item);
                      }}
                    />
                  )}
                  keyExtractor={item => item}
                />
              </View>
              {isLoading || isLoadingAction || isReseting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#00674a" size={'large'} />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                  }}>
                  <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'flex-start',
                          height: height,
                          width: width,

                          alignItems: 'center',
                          marginTop: height * 0.2,
                        }}>
                        <Icon source="inbox" color={'gray'} size={80} />
                        <Text style={{marginTop: 10, color: 'gray'}}>
                          ยังไม่มีงานแจ้งส่ง
                        </Text>
                      </View>
                    }
                    contentContainerStyle={
                      quotationData?.length === 0 && {flex: 1}
                    }
                  />
                </View>
              )}
            </>
          )}
        </Portal>
      </PaperProvider>
    </>
  );
};

export default Dashboard;
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    // padding: 30,
  },
  fabStyle: {
    bottom: height * 0.1,
    right: width * 0.05,
    position: 'absolute',
    // backgroundColor: '#1b52a7',
    backgroundColor: '#00674a',
    // backgroundColor: '#009995',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 10,
    backgroundColor: '#00674a',
    // backgroundColor: '#1b52a7',
    borderRadius: 28,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: 'white',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    // bottom: '40%',
    left: 0,
  },
  selectedQuotationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ModalButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    fontWeight: 'bold',

    // fontWeight: 'bold',
    fontFamily: 'Sukhumvit set',
  },
  deleteButtonText: {
    fontSize: 18,
    borderBottomWidth: 1,
    textDecorationColor: 'red',
    color: 'red',
    borderColor: 'white',
    paddingBottom: 10,
    fontFamily: 'Sukhumvit set',
    paddingTop: 10,
  },
  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    height: '80%',
  },
  customFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 10,
    // backgroundColor: '#0050f0',
    backgroundColor: '#012b20',

    borderRadius: 28,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    padding: 10,
    marginHorizontal: 5,
    marginVertical: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    height: 40,
  },
  activeFilter: {
    // backgroundColor:'#1b72e8',
    backgroundColor: '#1f303cff',
    color: 'white',
  },
  title: {
    marginBottom: 20,
    fontSize: 14,
    fontFamily: 'Sukhumvit Set Bold',
    color: 'gray',
  },
  whiteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    height: 50,
    width: 250,
    borderRadius: 5,
    marginTop: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  RedText: {
    marginTop: 10,
    fontSize: 14,
    alignSelf: 'center',
  },
});
