import {BACK_END_SERVER_URL} from '@env';
import {useRoute} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import React, {useContext, useState} from 'react';
import {Appbar, Button, ProgressBar, Text} from 'react-native-paper';
import {useForm, useWatch} from 'react-hook-form';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  
  Alert,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {Menu,ActivityIndicator} from 'react-native-paper';
import {useUser} from '../../../providers/UserContext';
import {Store} from '../../../redux/store';
// import AddNewWorker from './addNew';
import {WorkerEmbed, Workers} from '@prisma/client';
import AddNewWorker from '../../../components/workers/addNew';
import UpdateWorkers from '../../../components/workers/update';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../../types/navigationType';
import type {RouteProp} from '@react-navigation/native';
import {useDeleteWorker} from '../../../hooks/workers/delete';

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
}
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditWorkers'>;
  route: RouteProp<ParamListBase, 'EditWorkers'>;
}
const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const EditWorkers = ({navigation, route}: Props) => {
  const {
    state: {existingWorkers, code},
    dispatch,
  } = useContext(Store);
  const [workers, setWorkers] = useState<Workers[]>(existingWorkers);
  const [isAddNewModal, setIsAddNewModal] = useState<boolean>(false);
  const [isUpdateModal, setIsUpdateModal] = useState<boolean>(false);
  const [selectWoker, setSelectWorker] = useState<Workers | null>(null);
  const [refetch, setRefetch] = useState(false);
  const [visibleMenuIndex, setVisibleMenuIndex] = useState<number | null>(null);
  const user = useUser();

  const fetchExistingWorkers = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      let url = `${BACK_END_SERVER_URL}/api/company/getWorkers?code=${encodeURIComponent(
        code,
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setWorkers(data.workers);
      setRefetch(false);

      return data;
    }
  };
  const url = `${BACK_END_SERVER_URL}/api/company/deleteWorker`;
  const {
    isDeleting,
    error: deleteError,
    deleteWorker,
  } = useDeleteWorker(url, 'workers');

  const confirmDeleteWorker = (id: string, workerName: string) => {
    Alert.alert('ยืนยันการลบ', `ยืนยันลบ ${workerName} `, [
      {
        text: 'ยกเลิก',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'ยืนยัน', onPress: () => handleDeleteWorker(id)},
    ]);
  };

  const handleDeleteWorker = async (id: string) => {
    try {
      
      await deleteWorker(id);
    } catch (err) {
      console.error('An error occurred:', err);
      Alert.alert('ไม่สามารถลบข้อมูลได้', 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['Workers'],
    queryFn: fetchExistingWorkers,
  });

  if (isError) {
    console.log('error', error);
  }
  const handleAddNewWorker = () => {
    setIsAddNewModal(true);
  };
  return (
    <>
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
                  <Appbar.BackAction  onPress={() => navigation.goBack()} />

        <Appbar.Content
          title="ทีมช่างทั้งหมด"
          titleStyle={{fontSize: 18, fontWeight: 'bold'}}
        />
        <Appbar.Action icon={'plus'}  onPress={handleAddNewWorker} />
      </Appbar.Header>
      <View style={styles.container}>
        {isLoading || isDeleting  ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={workers}
            renderItem={({item, index}) => (
              <Menu
                visible={visibleMenuIndex === index}
                onDismiss={() => setVisibleMenuIndex(null)}
                anchorPosition="bottom"
                anchor={
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => {
                      setVisibleMenuIndex(index);
                    }}>
                    <View style={styles.textContainer}>
                      <Text style={styles.productTitle}>{item.name}</Text>
                      <Text style={styles.description}>{item.mainSkill}</Text>
                    </View>
                    <Image
                      source={{uri: item.image || undefined}}
                      style={styles.productImage}
                    />
                  </TouchableOpacity>
                }>
                <Menu.Item
                  leadingIcon="pencil"
                  onPress={() => {
                    setVisibleMenuIndex(null);
                    setSelectWorker(item);
                    setIsUpdateModal(true);
                  }}
                  title="แก้ไข"
                />
                <Menu.Item
                  leadingIcon="delete"
                  onPress={() => {
                    setVisibleMenuIndex(null);

                    confirmDeleteWorker(item.id, item.name);
                  
                  }}
                  title="ลบ"
                />
              </Menu>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  height: height,
                  width: width*0.9,
                  alignItems: 'center',
                }}>
                <Image
                  source={require('../../../assets/images/ConstructionWorker-bro.png')}
                  width={width * 0.5}
                  height={height * 0.3}
                  style={{
                    width: width * 0.6,
                    height: height * 0.3,
                  }}
                />
                <Text style={{marginTop: 20, color: 'gray'}}>
                  ยังไม่ได้เพิ่มทีมช่าง
                </Text>
              </View>
            }
            // ListEmptyComponent={
            //   <View
            //     style={{
            //       flex: 1,
            //       justifyContent: 'center',
            //       height: height * 0.5,

            //       alignItems: 'center',
            //     }}>
            //     <Button
            //       onPress={() => handleAddNewWorker()}
            //       mode="contained"
            //       icon={'plus'}>
            //       <Text
            //         variant="titleMedium"
            //         style={{color: 'white'}}>
            //         เพิ่มช่างใหม่
            //       </Text>
            //     </Button>
            //   </View>
            // }
            keyExtractor={item => item.id}
          />
        )}
      </View>
      <Modal
        isVisible={isAddNewModal}
        style={styles.modal}
        onBackdropPress={() => setIsAddNewModal(false)}>
        <AddNewWorker
          setRefetch={() => {
            setRefetch(true);
          }}
          onClose={() => setIsAddNewModal(false)}
        />
      </Modal>
      {selectWoker && (
        <Modal
          isVisible={isUpdateModal}
          style={styles.modal}
          onBackdropPress={() => setIsUpdateModal(false)}>
          <UpdateWorkers
            worker={selectWoker}
            setRefetch={() => {
              setRefetch(true);
            }}
            onClose={() => setIsUpdateModal(false)}
          />
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20, // Adjusted from 500 to a smaller value
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
  onPlusButton: {
    paddingVertical: 10,
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

export default EditWorkers;
