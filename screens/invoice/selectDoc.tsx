import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Store} from '../../redux/store';
import {
  QuotationStatus,
  QuotationStatusKey,
} from '../../models/QuotationStatus';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Appbar,
  Dialog,
  Divider,
  FAB,
  List,
  PaperProvider,
  Portal,
  Checkbox,
} from 'react-native-paper';
import {ParamListBase} from '../../types/navigationType';
import {StackNavigationProp} from '@react-navigation/stack';
import useFetchDashboard from '../../hooks/quotation/dashboard/useFetchDashboard';
import {useFilteredData} from '../../hooks/dashboard/useFilteredData';
import {useActiveFilter} from '../../hooks/dashboard/useActiveFilter';
import {Quotation, Service} from 'types/docType';
import * as stateAction from '../../redux/actions';
import CardDashBoard from '../../components/CardDashBoard';
import Modal from 'react-native-modal';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'Quotation'>;
}

const SelectDoc = ({navigation}: Props) => {
  const [open, setOpen] = React.useState(false);
  const onStateChange = ({open}: {open: boolean}) => setOpen(open);
  const [isLoadingAction, setIsLoadingAction] = React.useState(false);
  const {data, isLoading, isError, error} = useFetchDashboard();
  const {activeFilter, updateActiveFilter} = useActiveFilter();
  const {dispatch}: any = useContext(Store);
  const [selectedItem, setSelectedItem] = useState(null) as any;
  const [selectedIndex, setSelectedIndex] = useState(null) as any;
  const [showModal, setShowModal] = useState(true);
  const [originalData, setOriginalData] = React.useState<Quotation[] | null>(
    null,
  );

  const filteredData = useFilteredData(originalData, activeFilter);

  React.useEffect(() => {
    if (data) {
      // Ensuring data[0] exists and has a property `code` before attempting to access it
      if (!data[0]) {
        navigation.navigate('CreateCompanyScreen');
      } else {
        // If data[0] exists and has a non-null `code`, proceed with your logic

        setOriginalData(data[1]);
      }
    }
  }, [data]);

  const createNewByQuotation = async (services: Service[], quotation: Quotation) => {
    setIsLoadingAction(true);
    dispatch(stateAction.get_companyID(data[0].id));
    setIsLoadingAction(false);

    navigation.navigate('CreateByQuotation', {
      quotation,
      company: data[0],
      services,
    });
  };
  const handleModalClose = () => {
    // setSelectedItem(null);
    setSelectedIndex(null);
    setShowModal(false);
  };
  const handleModalOpen = (item: Quotation, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    // handleModal(item, index);
    setShowModal(true);
  };
  const renderItem = ({item, index}: any) => (
    <>
      <View style={{marginTop: 10}}>
        <CardDashBoard
          status={item.status}
          date={item.dateOffer}
          end={item.dateEnd}
          price={item.allTotal}
          customerName={item.customer?.name as string}
          onCardPress={() => handleModalOpen(item, index)}
        />
      </View>

      {selectedIndex === index && (
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
                    setShowModal(false);
                    createNewByQuotation(selectedItem.services, selectedItem);
                  }}
                  centered={true}
                  title="ใบวางบิลเต็มจำนวน"
                  titleStyle={{textAlign: 'center', color: 'black'}} // จัดให้ข้อความอยู่ตรงกลาง
                />

                <Divider />

                {/* <List.Item
                  onPress={() => {
                    setShowModal(false);
                    editQuotation(selectedItem.services, selectedItem);
                  }}
                  title="ใบวางบิลแบ่งงวดจ่าย"
                  titleStyle={{textAlign: 'center', color: 'black'}} // จัดให้ข้อความอยู่ตรงกลาง
                />

                <Divider /> */}
              </List.Section>
            </Modal>
          </PaperProvider>
        </Portal>
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
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content
              title={'สร้างใบวางบิลใหม่'}
              titleStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'Sukhumvit Set Bold',
              }}
            />
            <Appbar.Action
              icon="bell-outline"
              // onPress={() => {
              //   navigation.navigate('SearchScreen');
              // }}
            />
          </Appbar.Header>
          {isLoadingAction ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              {data && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: 'left',
                      marginTop: 16,
                      justifyContent: 'flex-start',
                      alignSelf: 'flex-start',
                      color: 'gray',
                      marginLeft: 20,
                    }}>
                    เลือกจากใบเสนอราคา
                  </Text>
                  <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          height: height * 0.5,

                          alignItems: 'center',
                        }}>
                        <Text style={{marginTop: 10}}>
                          สร้างใบเสนอราคาก่อนที่จะสร้างใบวางบิล
                        </Text>
                      </View>
                    }
                    contentContainerStyle={
                      filteredData?.length === 0 && {flex: 1}
                    }
                  />
                </View>
              )}
              {/* <FAB
                style={styles.fabStyle}
                icon="plus"
                // onPress={()=>testConnection()}
                onPress={() => {}}
                color="white"
              /> */}
            </>
          )}
        </Portal>
      </PaperProvider>
    </>
  );
};

export default SelectDoc;
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  fabStyle: {
    bottom: height * 0.1,
    right: width * 0.05,
    position: 'absolute',
    backgroundColor: '#1b52a7',
  },
  container: {
    flex: 1,
    padding: 16,
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
  summaryText: {
    fontSize: 16,

    color: '#19232e',
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
  emptyListText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
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
  row: {
    flexDirection: 'row',
    width: '99%',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: width,
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
  summaryPrice: {
    fontSize: 14,
    alignSelf: 'flex-end',
    color: '#19232e',
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
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'center',
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

  card: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1, // Add border to the card
    borderColor: 'transparent', // Default border color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    width: width - 32, // Adjust based on your padding
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
    fontWeight: 'bold',
    color: 'black',
  },
  description: {
    fontSize: 12,
    color: 'gray',
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
