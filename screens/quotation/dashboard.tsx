import {BACK_END_SERVER_URL} from '@env';
import messaging from '@react-native-firebase/messaging';
import {DrawerActions} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import * as contrains from '../../redux/constrains';
import React, {useContext, useEffect, useState, useCallback} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
  DevSettings,
} from 'react-native';
import Modal from 'react-native-modal';
import CardDashBoard from '../../components/CardDashBoard';
import {QuotationsFilterButton} from '../../components/ui/Dashboard/FilterButton'; // Adjust the import path as necessary
import firebase from '../../firebase';
import {useActiveFilter} from '../../hooks/dashboard/useActiveFilter';
import {useFilteredData} from '../../hooks/dashboard/useFilteredData';
import {useUser} from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';

import {DashboardScreenProps} from '../../types/navigationType';

import {
  Appbar,
  Dialog,
  Divider,
  FAB,
  Icon,
  List,
  PaperProvider,
  ActivityIndicator,
  Portal,
  Menu,
} from 'react-native-paper';
import {requestNotifications} from 'react-native-permissions';
import useFetchDashboard from '../../hooks/quotation/dashboard/useFetchDashboard'; // adjust the path as needed

import {
  CustomerEmbed,
  NotificationType,
  QuotationStatus,
  Quotations,
  ServicesEmbed,
} from '@prisma/client';
import {CompanyOnly, CompanyState} from 'types';
import {useModal} from '../../hooks/quotation/create/useModal';
import useResetQuotation from '../../hooks/quotation/update/resetStatus';
import FABButton from '../../components/ui/Button/FAB';
import useCheckSubscription from '../../hooks/useCheckSubscription';
import SelectPackages from '../../components/payment/selectPackages';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}
const Dashboard = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(true);
  const {isVisible, setIsVisible, checkSubscription} = useCheckSubscription();
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
    state: {quotations,sellerId},
  } = useContext(Store);
  const {data, isLoading, isError, error, refetch} = useFetchDashboard();
  const {activeFilter, updateActiveFilter} = useActiveFilter();
  const {width, height} = Dimensions.get('window');
  const [refreshing, setRefreshing] = useState(false);
  const [checkSelctPackage, setCheckSelctPackage] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const queryClient = useQueryClient();
  const [isModalSignContract, setIsModalSignContract] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Quotations | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const filteredData = useFilteredData(
    quotations,
    activeFilter as QuotationStatus,
  );
  const [companyData, setCompanyData] = useState<CompanyState | null>(null);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  }, [refetch]);
  const handleErrorResponse = (error: ErrorResponse) => {
    switch (error.message) {
      case 'logout':
        console.log('Unhandled error logout action:', error.message);
        dispatch(stateAction.reset_firebase_user());
        handleLogout();
        DevSettings.reload();
        break;
      case 'redirectToCreateCompany':
        navigation.navigate('CreateCompanyScreen');
        break;
      case 'retry':
        console.log('Retrying...');
        // Implement retry logic here if necessary
        break;
      default:
        console.log('Unhandled error action:', error.message);
        handleLogout();
        DevSettings.reload();
    }
  };

  const handleNoResponse = () => {
    setIsModalSignContract(false);
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
    if (!checkSubscription()) {
      return;
    }
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
    if (!checkSubscription()) {
      return;
    }
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
    if (!checkSubscription()) {
      return;
    }
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
      const companyOnly: CompanyState = {
        ...data.company,
        quotations: [],
        workers: [],
        invoices: [],
        receipts: [],
        defaultWarranty: null,
        submissions: [],
        defaultContracts: null,
        defaultStandards: [],
        defaultMaterials: [],
        users: [],
      };
      setCompanyData(companyOnly);
      dispatch(stateAction.get_company_state(companyOnly));

      dispatch(stateAction.get_companyID(companyOnly.id));
      // Sort the quotations by the most recently updated date
      const sortedQuotations = data.company?.quotations.sort((a, b) => {
        const dateA = new Date(a.updated);
        const dateB = new Date(b.updated);
        return dateB.getTime() - dateA.getTime();
      });
      dispatch(stateAction.get_quotations(sortedQuotations));
    }
  }, [data]);

  useEffect(() => {
    const initializeListeners = () => {
      const messageUnsubscribe = messaging().onMessage(async remoteMessage => {
        if (remoteMessage.notification) {
          const {title, body} = remoteMessage.notification;
          if (title && body) {
            Alert.alert(title, body);
          }
        }
      });

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });

      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification,
        );
        if (remoteMessage.data && remoteMessage.data.eventType) {
          handleNavigation(remoteMessage.data);
        }
      });

      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage.notification,
            );
            if (remoteMessage.data && remoteMessage.data.eventType) {
              handleNavigation(remoteMessage.data);
            }
          }
        });

      return messageUnsubscribe;
    };

    const handleNavigation = (
      data:
        | {eventType: string; docId: string}
        | {[key: string]: string | object},
    ) => {
      const {eventType, docId} = data;
      switch (eventType) {
        case NotificationType.SubmissionEvent:
          navigation.navigate('DashboardSubmit');
          break;
        case NotificationType.QuotationEvent:
          const quotation: Quotations | undefined = quotations?.find(
            q => q.id === docId,
          );
          if (quotation) {
            dispatch(stateAction.get_edit_quotation(quotation));
            navigation.navigate('CreateQuotation');
          } else {
            return;
          }

          break;
        // default:
        //   navigation.navigate('DefaultScreen', { submissionId });
        // break;
      }
    };
    // Request notification permission and initialize listeners
    requestNotificationPermission().then(() => {
      initializeListeners();
    });
  }, []);
  useEffect(() => {
    if (user) {
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
    QuotationStatus.PENDING,
    // QuotationStatus.APPROVED,
    // QuotationStatus.INVOICE_DEPOSIT,
    // QuotationStatus.RECEIPT_DEPOSIT,
    QuotationStatus.SUBMITTED,
    QuotationStatus.EXPIRED,
  ];
  const handleCreateContract = (index: number) => {
    if (
      companyData &&
      // quotationData &&
      // quotationData.length > 0 &&
      selectedItem
    ) {
      navigation.navigate('ContractOptions', {
        id: selectedItem.id,
        sellerId: selectedItem.id,
        allTotal: selectedItem.allTotal,
        customerName: selectedItem.customer?.name as string,
      });
    }
    setIsModalSignContract(false);
  };
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
  const editQuotation = async (quotation: Quotations) => {
    if (!checkSubscription()) {
      return;
    }
    setIsLoadingAction(true);
    dispatch(stateAction.get_edit_quotation(quotation));
    setIsLoadingAction(false);
    handleModalClose();
    navigation.navigate('CreateQuotation');
  };

  if (isError && error) {
    handleErrorResponse(error);
  }
  console.log('sellerId',sellerId)

  const renderItem = ({item, index}: any) => (
    <>
      <View style={{marginTop: 10}}>
        <CardDashBoard
          status={item.status}
          date={item.dateOffer}
          events={item.events}
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
                  <List.Item
                    onPress={() => {
                      handleModalClose();
                      navigation.navigate('ProjectViewScreen', {
                        id: item.id,
                        fileName: `${item.customer.name}`,
                      });
                    }}
                    centered={true}
                    title="พรีวิว"
                    titleStyle={{textAlign: 'center', color: 'black'}}
                  />

                  <Divider />
                  <List.Item
                    onPress={() => {
                      handleModalClose();
                      navigation.navigate('PDFViewScreen', {
                        pdfUrl: item.pdfUrl,
                        fileType: 'QT',
                        fileName: `${item.customer.name}.pdf`,
                      });
                    }}
                    title="ดูเอกสาร PDF"
                    titleStyle={{textAlign: 'center'}}
                  />

                  <Divider />

                  {(selectedItem.status === QuotationStatus.PENDING ||
                    selectedItem.status === QuotationStatus.EXPIRED) && (
                    <>
                      <List.Item
                        onPress={() => {
                          setShowModal(false);
                          editQuotation(selectedItem);
                        }}
                        title="แก้ไข"
                        titleStyle={{textAlign: 'center', color: 'black'}}
                      />

                      <Divider />
                      <List.Item
                        onPress={() => {
                          dispatch(
                            stateAction.get_edit_quotation(selectedItem),
                          );
                          setShowModal(false);
                          navigation.navigate('CreateNewInvoice');
                        }}
                        title="สร้างใบวางบิล"
                        titleStyle={{textAlign: 'center'}}
                      />
                      <Divider />
                      <List.Item
                        onPress={() => {
                          dispatch(
                            stateAction.get_edit_quotation(selectedItem),
                          );

                          setShowModal(false);
                          navigation.navigate('InvoiceDepositScreen');
                        }}
                        title="มัดจำใบวางบิล"
                        titleStyle={{textAlign: 'center'}}
                      />
                      <Divider />
                      <List.Item
                        onPress={() => {
                          dispatch(
                            stateAction.get_edit_quotation(selectedItem),
                          );
                          dispatch(
                            stateAction.get_quotation_ref_number(
                              selectedItem.docNumber,
                            ),
                          );
                          dispatch(
                            stateAction.get_quotation_id(selectedItem.id),
                          );
                          setShowModal(false);
                          navigation.navigate('CreateNewReceipt');
                        }}
                        title="สร้างใบเสร็จรับเงิน"
                        titleStyle={{textAlign: 'center'}}
                      />

                      <Divider />
                      <List.Item
                        onPress={() => {
                          dispatch(
                            stateAction.get_edit_quotation(selectedItem),
                          );
                          setShowModal(false);
                          navigation.navigate('ReceiptDepositScreen');
                        }}
                        title="มัดจำใบเสร็จรับเงิน"
                        titleStyle={{textAlign: 'center'}}
                      />
                    </>
                  )}
                  {selectedItem?.status === QuotationStatus.INVOICE_DEPOSIT && (
                    <>
                      <Divider />
                      <List.Item
                        onPress={() => {
                          dispatch(
                            stateAction.get_edit_quotation(selectedItem),
                          );
                          setShowModal(false);
                          navigation.navigate('InvoiceDepositScreen');
                        }}
                        centered={true}
                        title="วางบิลส่วนที่เหลือ"
                        titleStyle={{textAlign: 'center', color: 'black'}}
                      />
                    </>
                  )}
                  {selectedItem?.status === QuotationStatus.RECEIPT_DEPOSIT && (
                    <>
                      <Divider />
                      <List.Item
                        onPress={() => {}}
                        centered={true}
                        title="ใบเสร็จรับเงินส่วนที่เหลือ"
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
                      dispatch(stateAction.reset_edit_submission() as any);
                      dispatch(stateAction.get_edit_quotation(selectedItem));
                      dispatch(stateAction.get_quotation_id(selectedItem.id));
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
                  <List.Item
                    onPress={() =>
                      confirmRemoveQuotation(item.id, item?.customer?.name)
                    }
                    title="ลบ"
                    titleStyle={{textAlign: 'center', color: 'red'}}
                  />
                </List.Section>
              </Modal>
            </PaperProvider>
          </Portal>
        </>
      )}
    </>
  );

  const createNewQuotation = () => {
    if (!checkSubscription()) {
      return;
    }
    if (!companyData) {
      navigation.navigate('CreateCompanyScreen');
    }
    dispatch(stateAction.reset_edit_quotation());
    navigation.navigate('CreateQuotation');
  };
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
              title={'ใบเสนอราคา  '}
              titleStyle={{
                fontSize: 18,
                fontWeight: 'bold',
              }}
            />
            {/* <Appbar.Action
              icon="bell-outline"
              onPress={() => {
                navigation.navigate('NotificationScreen');
              }}
            /> */}
          </Appbar.Header>
          {isLoadingAction ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator color="#047e6e" size={'large'} />
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
              {isLoading || isLoadingAction || (isReseting && !refreshing) ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator color="#047e6e" size={'large'} />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                  }}>
                  <>
                    {activeFilter === QuotationStatus.EXPIRED &&
                      filteredData &&
                      filteredData.length > 0 && (
                        <Text
                          style={{
                            textAlign: 'center',
                            marginVertical: height * 0.02,
                          }}>
                          เอกสารหมดอายุจะถูกลบภายใน 30 วัน
                        </Text>
                      )}
                    <FlatList
                      data={filteredData}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                        />
                      }
                      onRefresh={onRefresh}
                      renderItem={renderItem}
                      refreshing={refreshing}
                      keyExtractor={item => item.id}
                      ListEmptyComponent={
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            height: height,
                            width: width,

                            alignItems: 'center',
                          }}>
                          <Image
                            source={require('../../assets/images/Audit-amico.png')}
                            width={width * 0.5}
                            height={height * 0.3}
                            style={{
                              width: width * 0.5,
                              height: height * 0.3,
                            }}
                          />
                          <Text style={{marginTop: 10, color: 'gray'}}>
                            ยังไม่มีเอกสาร
                          </Text>
             
                        </View>
                      }
                      contentContainerStyle={
                        quotations?.length === 0 && {flex: 1}
                      }
                    />
                  </>
                </View>
              )}
              <FABButton createNewFunction={createNewQuotation} />
            </>
          )}

          <Dialog
            style={styles.modalContainer}
            // backdropTransitionOutTiming={100}
            onDismiss={handleNoResponse}
            visible={isModalSignContract}>
            <Dialog.Content>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={styles.selectedQuotationText}>
                  ทำสัญญากับลูกค้า
                </Text>
                <Text style={styles.selectedQuotationText}>
                  {selectedItem?.customer?.name}
                </Text>
                <Text style={styles.modalText}>
                  คุณได้นัดเข้าดูพื้นที่หน้างานโครงการนี้เรียบร้อยแล้วหรือไม่ ?
                </Text>
                {selectedIndex !== null && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      handleCreateContract(selectedIndex);
                    }}>
                    <Text style={styles.whiteText}> ดูหน้างานแล้ว</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleNoResponse}>
                  <Text style={styles.whiteText}>ยังไม่ได้ดูหน้างาน</Text>
                </TouchableOpacity>
                <Text style={styles.RedText}>
                  {' '}
                  *จำเป็นต้องดูหน้างานก่อนเริ่มทำสัญญา
                </Text>
              </View>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </PaperProvider>
      <SelectPackages
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
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
    backgroundColor: '#027f6f',
    // backgroundColor: '#1b52a7',
    // backgroundColor: '#00674a',
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
