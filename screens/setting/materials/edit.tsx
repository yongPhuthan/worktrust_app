import React, {useContext, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';

import {BACK_END_SERVER_URL} from '@env';
import {DefaultMaterials, MaterialEmbed} from '@prisma/client';
import {useQuery} from '@tanstack/react-query';
import {useFormContext} from 'react-hook-form';
import Modal from 'react-native-modal';
import {
  Appbar,
  Button,
  Menu,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import {useUser} from '../../../providers/UserContext';
import {Store} from '../../../redux/store';
import CreateMaterial from '../../../components/materials/createMaterial';
import {useDeleteMaterial} from '../../../hooks/materials/delete';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../../types/navigationType';
import type {RouteProp} from '@react-navigation/native';
import UpdateMaterial from '../../../components/materials/update';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditMaterials'>;
  route: RouteProp<ParamListBase, 'EditMaterials'>;
}

const url = `${BACK_END_SERVER_URL}/api/company/deleteMaterial`;
const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const EditMaterials = ({navigation, route}: Props) => {
  const [materials, setMaterials] = useState<DefaultMaterials[]>([]);
  const [selectMaterial, setSelectMaterial] = useState<DefaultMaterials | null>(
    null,
  );
  const [isUpdateModal, setIsUpdateModal] = useState<boolean>(false);
  const [refetch, setRefetch] = useState(false);
  const [visibleMenuIndex, setVisibleMenuIndex] = useState<number | null>(null);
  const [isCreateMaterial, setIsCreateMaterial] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(false);

  const user = useUser();

  const {
    state: {companyId},
    dispatch,
  } = useContext(Store);

  const fetchExistingMaterials = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);

      let url = `${BACK_END_SERVER_URL}/api/services/queryMaterials?id=${encodeURIComponent(
        companyId,
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data: DefaultMaterials[] = await response.json();

      if (!response.ok) {
        // console.log('error', data)
        throw new Error('Network response was not ok');
      }
      const sortedData = data.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
      );
      setMaterials(sortedData);

      return data;
    }
  };
  const {
    isDeleting,
    error: deleteError,
    deleteMaterial,
  } = useDeleteMaterial(url, 'defaultMaterials');

  const confirmDeleteMaterial = (id: string, name: string) => {
    Alert.alert(`ยืนยันลบ ${name} `, `ยืนยันลบ ${name} หรือไม่ ? `, [
      {
        text: 'ยกเลิก',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'ยืนยัน', onPress: () => handleDeleteMaterial(id)},
    ]);
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteMaterial(id);
    } catch (err) {
      console.error('An error occurred:', err);
      Alert.alert('ไม่สามารถลบข้อมูลได้', 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const {data, isLoading, isError} = useQuery({
    queryKey: ['defaultMaterials'],
    queryFn: fetchExistingMaterials,
  });

  return (
    <>
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="วัสดุอุปกรณ์ทั้งหมด"
          titleStyle={{fontSize: 16, fontWeight: 'bold'}}
        />
        {materials && (
          <Appbar.Action
            icon="plus"
            onPress={() => setIsCreateMaterial(true)}
          />
        )}
      </Appbar.Header>
      <View style={styles.container}>
        {isLoading || isDeleting ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
          <ActivityIndicator color="#047e6e" size={'large'} />

          </View>
        ) : (
          <FlatList
            data={materials}
            renderItem={({item, index}) => (
              <Menu
                visible={visibleMenuIndex === index}
                onDismiss={() => setVisibleMenuIndex(null)}
                anchorPosition="bottom"
                anchor={
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => setVisibleMenuIndex(index)}>
                    <View style={styles.textContainer}>
                      <Text style={styles.productTitle}>{item.name}</Text>
                      <Text style={styles.description}>{item.description}</Text>
                    </View>
                    <Image
                      source={{uri: item.image}}
                      style={styles.productImage}
                    />
                  </TouchableOpacity>
                }>
                <Menu.Item
                  leadingIcon="pencil"
                  onPress={() => {
                    setVisibleMenuIndex(null);
                    setSelectMaterial(item);
                    setIsUpdateModal(true);
                  }}
                  title="แก้ไข"
                />
                <Menu.Item
                  leadingIcon="delete"
                  onPress={() => {
                    setVisibleMenuIndex(null);

                    confirmDeleteMaterial(item.id, item.name);
                  }}
                  title="ลบ"
                />
              </Menu>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  height: height * 0.5,

                  alignItems: 'center',
                }}>
                <Button
                  onPress={() => setIsCreateMaterial(true)}
                  mode="contained"
                  icon={'plus'}>
                  <Text variant="titleMedium" style={{color: 'white'}}>
                    เพิ่มวัสดุอุปกรณ์
                  </Text>
                </Button>
              </View>
            }
            keyExtractor={item => item.id}
          />
        )}

        <Modal
          isVisible={isCreateMaterial}
          style={styles.modal}
          onBackdropPress={() => setIsCreateMaterial(false)}>
          <CreateMaterial
            isVisible={isCreateMaterial}
            onClose={() => setIsCreateMaterial(false)}
          />
        </Modal>
      </View>
      {selectMaterial && (
        <Modal
          isVisible={isUpdateModal}
          style={styles.modal}
          onBackdropPress={() => setIsUpdateModal(false)}>
          <UpdateMaterial
            material={selectMaterial}
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
    paddingHorizontal: 10,
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

export default EditMaterials;
