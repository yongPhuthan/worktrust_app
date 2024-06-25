import messaging from '@react-native-firebase/messaging';
import { DrawerActions } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import CardDashBoard from '../../components/warranty/CardDashBoard';
import { QuotationsFilterButton, WarrantyFilterButton } from '../../components/ui/Dashboard/FilterButton'; // Adjust the import path as necessary
import firebase from '../../firebase';
import { useActiveFilter, useActiveWarrantyFilter } from '../../hooks/dashboard/useActiveFilter';
import {
  useFilteredData,
  useFilteredWarrantyData
} from '../../hooks/dashboard/useFilteredData';
import { useUser } from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import { Store } from '../../redux/store';

import { DashboardScreenProps } from '../../types/navigationType';

import {
  ActivityIndicator,
  Appbar,
  Icon,
  PaperProvider,
  Portal
} from 'react-native-paper';
import { requestNotifications } from 'react-native-permissions';
import useFetchDashboard from '../../hooks/warranty/useFetchDashBoard';

import {
  QuotationStatus,
  Quotations,
  WarrantyEmbed,
  WarrantyStatus
} from '@prisma/client';
import { CompanyState } from 'types';
import useResetQuotation from '../../hooks/quotation/update/resetStatus';
interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}
const DashboardWarranty = ({navigation}: DashboardScreenProps) => {
  const user = useUser();
  const {
    dispatch,
    state: {code},
  }= useContext(Store);
  const {data, isLoading, isError, error} = useFetchDashboard();
  const {activeFilter, updateActiveFilter} = useActiveWarrantyFilter();
  const {width, height} = Dimensions.get('window');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const queryClient = useQueryClient();
  const [originalData, setOriginalData] = useState<Quotations[] | null>(null);
  const filteredData = useFilteredWarrantyData(
    originalData,
    activeFilter as WarrantyStatus,
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
        console.log('Unhandled error action:', error.message);
        handleLogout();
        
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




  const {mutate: resetStatus, isPending: isReseting} = useResetQuotation();

  useEffect(() => {
    if (data && data.company ) {
      const sortedQuotations = data.company.quotations.sort((a, b) => {
        const dateA = new Date(a.updated);
        const dateB = new Date(b.updated);
        return dateB.getTime() - dateA.getTime();
      });
      setQuotationData(sortedQuotations);
      setOriginalData(sortedQuotations);
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
    WarrantyStatus.ALL,
    WarrantyStatus.PENDING,
    WarrantyStatus.ACTIVE,
    WarrantyStatus.EXPIRED,
  ];


  const handleWarranty = (item: Quotations) => {
    dispatch(
      stateAction.get_edit_quotation(item),
    );
    navigation.navigate('CreateWarranty');         
  }

  if (isError && error) {
    handleErrorResponse(error);
  }

  const renderItem = ({item, index}: {item: Quotations, index: number}) => (
    <>
      <View key={index} style={{marginTop: 10}}>
        
        <CardDashBoard
          status={item.warrantyStatus || ''}
          price={item.allTotal}
          customerName={item.customer?.name as string}
          onCardPress={() =>handleWarranty(item)}
        />
      </View>
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
              title={'ใบรับประกัน  '}
              titleStyle={{
                fontSize: 18,
                fontWeight: 'bold',
              }}
            />
            {/* <Appbar.Action
              icon="bell-outline"
   
            /> */}
          </Appbar.Header>
          {isLoadingAction  ? (
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
                    <WarrantyFilterButton
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
                  <ActivityIndicator color='#00674a' size={'large'} />
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

export default DashboardWarranty;
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
