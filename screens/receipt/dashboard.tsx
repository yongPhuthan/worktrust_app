import {BACK_END_SERVER_URL} from '@env';
import messaging from '@react-native-firebase/messaging';
import {DrawerActions} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';

import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import CardDashBoard from '../../components/ui/invoice/CardDashboard';
import {
  QuotationsFilterButton,
  ReceiptsFilterButton,
} from '../../components/ui/Dashboard/FilterButton'; // Adjust the import path as necessary
import firebase from '../../firebase';
import {
  useActiveFilter,
  useActiveInvoiceFilter,
  useActiveReceiptFilter,
} from '../../hooks/dashboard/useActiveFilter';
import {useFilteredReceiptsData} from '../../hooks/dashboard/useFilteredData';
import {useUser} from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';
import useCheckSubscription from '../../hooks/useCheckSubscription';
import SelectPackages from '../../components/payment/selectPackages';

import {DashboardScreenProps} from '../../types/navigationType';

import {
  Appbar,
  Divider,
  FAB,
  Icon,
  List,
  PaperProvider,
  ActivityIndicator,
  Portal,
} from 'react-native-paper';
import {requestNotifications} from 'react-native-permissions';

import {
  Company,
  CustomerEmbed,
  ReceiptStatus,
  Receipts,
  ServicesEmbed,
} from '@prisma/client';
import useFetchDashboardInvoice from '../../hooks/invoice/queryInvoices';
import {useModal} from '../../hooks/quotation/create/useModal';
import FABButton from '../../components/ui/Button/FAB';
import useFetchDashboardReceipt from '../../hooks/receipt/queryReceipts';
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
    state: {G_subscription},
  } = useContext(Store);
  const {data, isLoading, isError, error} = useFetchDashboardReceipt();
  const {activeFilter, updateActiveFilter} = useActiveReceiptFilter();
  const {width, height} = Dimensions.get('window');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const queryClient = useQueryClient();
  const {isVisible, setIsVisible, checkSubscription} = useCheckSubscription();

  const [isModalSignContract, setIsModalSignContract] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Receipts | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<Receipts[] | null>(null);
  const filteredData = useFilteredReceiptsData(
    originalData,
    activeFilter as ReceiptStatus,
  );
  const [invoicesData, setReceiptsData] = useState<Receipts[] | null>(null);
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

  const removeReceipt = async (id: string) => {
    if (!checkSubscription()) {
      return;
    }

    handleModalClose();
    setIsLoadingAction(true);
    if (!user || !user.uid) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/receipt/deleteReceipt?id=${encodeURIComponent(
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
          queryKey: ['dashboardReceipt'],
        });
        setIsLoadingAction(false);
      } else {
        // It's good practice to handle HTTP error statuses
        const errorResponse = await response.text(); // or response.json() if the server responds with JSON
        console.error('Failed to delete receipt:', errorResponse);
        setIsLoadingAction(false);
        // Display a more specific error message if possible
        Alert.alert('Error', 'Failed to delete receipt. Please try again.');
      }
    } catch (err) {
      console.error('An error occurred:', err);
      setIsLoadingAction(false);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบเอกสารได้');
    }
  };

  const confirmRemoveReceipt = (id: string, customerName: string) => {
    setShowModal(false);
    if (!checkSubscription()) {
      return;
    }
    Alert.alert(
      'ยืนยันลบเอกสาร',
      `ลูกค้า ${customerName}`,
      [
        {
          text: 'ยกเลิก',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'ลบเอกสาร', onPress: () => removeReceipt(id)},
      ],
      {cancelable: false},
    );
  };
  useEffect(() => {
    if (data && data.company && data.company.receipts) {
      const sortedReceipts = data.company?.receipts.sort((a, b) => {
        const dateA = new Date(a.updated);
        const dateB = new Date(b.updated);
        return dateB.getTime() - dateA.getTime();
      });

      setReceiptsData(sortedReceipts);
      setOriginalData(sortedReceipts);
    }
  }, [data]);

  useEffect(() => {
    requestNotificationPermission();
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

  const filtersToShow = [
    ReceiptStatus.ALL,
    ReceiptStatus.PENDING,
    ReceiptStatus.BILLED,
  ];

  const handleModalOpen = (item: Receipts, index: number) => {
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
  const editReceipt = async (services: ServicesEmbed[], receipt: Receipts) => {
    if (!checkSubscription()) {
      return;
    }

    setIsLoadingAction(true);

    dispatch(stateAction.get_companyID(receipt.companyId));
    dispatch(stateAction.get_edit_receipt(receipt));
    setIsLoadingAction(false);
    handleModalClose();
    navigation.navigate('CreateNewReceipt');
  };

  // if (isError && error) {
  //   handleErrorResponse(error);
  // }
  const renderItem = ({item, index}: {item: Receipts; index: number}) => (
    <>
      {item.status && (
        <View style={{marginTop: 10}}>
          <CardDashBoard
            status={item.status}
            date={item.dateOffer}
            end={null}
            price={item.allTotal}
            customerName={item.customer.name}
            // onCardPress={()=>handleModal(item, index)}
            onCardPress={() => handleModalOpen(item, index)}
          />
        </View>
      )}

      {selectedIndex === index && selectedItem && (
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
                      navigation.navigate('PDFViewScreen', {
                        pdfUrl: item.pdfUrl ?? '',
                        fileType: 'IV',
                        fileName: `${item.customer.name}.pdf`,
                      });
                    }}
                    title="ดูเอกสาร PDF"
                    titleStyle={{textAlign: 'center'}}
                  />
                  <Divider />

                  {selectedItem?.status === ReceiptStatus.PENDING && (
                    <>
                      <List.Item
                        onPress={() => {
                          setShowModal(false);
                          editReceipt(selectedItem.services, selectedItem);
                        }}
                        title="แก้ไข"
                        titleStyle={{textAlign: 'center', color: 'black'}}
                      />

                      <Divider />

                      <List.Item
                        onPress={() => {
                          dispatch(stateAction.get_edit_receipt(selectedItem));
                          setShowModal(false);
                          navigation.navigate('ReceiptDepositScreen');
                        }}
                        title="เปิดบิลแล้ว"
                        titleStyle={{textAlign: 'center'}}
                      />
                    </>
                  )}

                  {selectedItem?.status === ReceiptStatus.BILLED && (
                    <>
                      <Divider />
                      <List.Item
                        onPress={() => {}}
                        centered={true}
                        title="รีเซ็ต"
                        titleStyle={{textAlign: 'center', color: 'black'}}
                      />
                    </>
                  )}

                  <Divider />

                  <List.Item
                    onPress={() =>
                      confirmRemoveReceipt(item.id, item.customer.name)
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

  const createNewReceipt = () => {
    if (!checkSubscription()) {
      return;
    }
    dispatch(stateAction.reset_edit_invoice());
    dispatch(stateAction.reset_edit_receipt());
    dispatch(stateAction.reset_edit_quotation());
    navigation.navigate('CreateNewReceipt');
  };
  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text>เกิดข้อผิดพลาด {error?.message}</Text>
      </View>
    );
  }
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
              title={'ใบเสร็จรับเงิน'}
              titleStyle={{
                fontSize: 18,
                fontWeight: 'bold',
              }}
            />
            {/* <Appbar.Action
              icon="bell-outline"

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
                {/* <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={filtersToShow}
                  renderItem={({item}) => (
                    <ReceiptsFilterButton
                      filter={item}
                      isActive={item === activeFilter}
                      onPress={() => {
                        updateActiveFilter(item);
                      }}
                    />
                  )}
                  keyExtractor={item => item}
                /> */}
              </View>
              {isLoading || isLoadingAction ? (
                <View style={styles.loadingContainer}>
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
                          ยังไม่มีใบเสร็จรับเงิน
                        </Text>
                      </View>
                    }
                    contentContainerStyle={
                      invoicesData?.length === 0 && {flex: 1}
                    }
                  />
                </View>
              )}
              <FABButton createNewFunction={createNewReceipt} />
            </>
          )}
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
    backgroundColor: '#1b52a7',
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
