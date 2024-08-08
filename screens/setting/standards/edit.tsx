import React, {useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {Store} from '../../../redux/store';

import {BACK_END_SERVER_URL} from '@env';
import {useQuery} from '@tanstack/react-query';
import {useFormContext, useForm} from 'react-hook-form';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../../types/navigationType';
import type {RouteProp} from '@react-navigation/native';

import Modal from 'react-native-modal';
import {useDeleteMaterial} from '../../../hooks/materials/delete';

import {
  Appbar,
  Banner,
  Button,
  Checkbox,
  IconButton,
  List,
  Menu,
  Snackbar,
  Text,
} from 'react-native-paper';
import {useUser} from '../../../providers/UserContext';
import CreateStandard from '../../../components/standard/createStandard';
import {useDeleteStandard} from '../../../hooks/standard/delete';
import UpdateStandard from '../../../components/standard/update';
import { DefaultStandard } from 'models/schema';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditStandard'>;
  route: RouteProp<ParamListBase, 'EditStandard'>;
}
const deleteUrl = `${BACK_END_SERVER_URL}/api/company/deleteStandard`;

const EditStandard = ({navigation, route}: Props) => {
  const [showCards, setShowCards] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const [isCreateStandard, setIsCreateStandard] = useState(false);
  const [isUpdateModal, setIsUpdateModal] = useState<boolean>(false);
  const [visibleMenuIndex, setVisibleMenuIndex] = useState<number | null>(null);
  const user = useUser();
  const [selectStandard, setSelectStandard] = useState<DefaultStandard | null>(
    null,
  );
  const [standardDatas, setStandardDatas] = useState<DefaultStandard[] | null>(
    null,
  );

  const {
    state: {companyId, code},
    dispatch,
  } = useContext(Store);

  const initialStandard: DefaultStandard = {
    id: '',
    standardShowTitle: '',
    image: '',
    content: '',
    badStandardImage: '',
    badStandardEffect: '',
    companyId,
    createdAt: new Date(),
  };

  const {
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = useForm<DefaultStandard>({
    defaultValues: initialStandard,
  });
  const fetchStandards = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      let url = `${BACK_END_SERVER_URL}/api/services/queryStandards?id=${encodeURIComponent(
        companyId,
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data: DefaultStandard[] = await response.json();
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setStandardDatas(sortedData);
      return sortedData;
    }
  };

  const {data, isLoading, isError} = useQuery({
    queryKey: ['standards'],
    queryFn: fetchStandards,
  });

  const {
    isDeleting,
    error: deleteError,
    deleteStandard,
  } = useDeleteStandard(deleteUrl, 'standards');

  const confirmDeleteStandard = (id: string, name: string) => {
    Alert.alert(`ยืนยันลบ ${name} `, ``, [
      {
        text: 'ยกเลิก',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'ยืนยัน', onPress: () => handleDeleteStandard(id)},
    ]);
  };

  const handleDeleteStandard = async (id: string) => {
    try {
      await deleteStandard(id);
    } catch (err) {
      console.error('An error occurred:', err);
      Alert.alert('ไม่สามารถลบข้อมูลได้', 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <>
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.BackAction  onPress={() => navigation.goBack()} />

        <Appbar.Content
          title={`มาตรฐานทั้งหมด ${standardDatas?.length || 0} รายการ`}
          titleStyle={{
            fontSize: 16,
          }}
        />
        {standardDatas && standardDatas?.length > 0 && (
          <Appbar.Action
            icon="plus"
            onPress={() => setIsCreateStandard(true)}
          />
        )}
      </Appbar.Header>
      {isLoading || isDeleting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#047e6e" size={'large'} />
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <FlatList
            style={{padding: 10}}
            data={standardDatas}
            renderItem={({item, index}) => (
              <View
                style={[styles.card]}
                // onPress={() => handleSelectAudit(item)}
              >
                <View
                  style={{
                    flexDirection: 'column',
                    width: '100%',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 'auto',
                      justifyContent: 'space-between',
                      paddingLeft: 15,
                      gap: 10,
                      maxWidth: '100%',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        // fontWeight: 'bold',
                        color: 'black',
                        alignSelf: 'center',
                        paddingVertical: 10,
                        maxWidth: '70%',
                      }}>
                      {index + 1}. {item.standardShowTitle}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        paddingVertical: 10,
                      }}>
                      <IconButton
                        size={20}
                        icon="pencil"
                        iconColor="gray"
                        onPress={() => {
                          setVisibleMenuIndex(null);
                          setSelectStandard(item);
                          setIsUpdateModal(true);
                        }}
                      />
                      <IconButton
                        size={20}
                        iconColor="gray"
                        icon="delete"
                        onPress={() => {
                          setVisibleMenuIndex(null);

                          confirmDeleteStandard(
                            item.id,
                            item.standardShowTitle || '',
                          );
                        }}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'column',
                      paddingHorizontal: 10,
                      gap: 5,
                    }}>
                    <List.Section>
                      <List.Accordion
                        title="รูปภาพ"
                        titleStyle={{fontSize: 16}}
                        style={{width: '100%'}}>
                        <List.Item
                          title={
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                paddingHorizontal: 10,
                                gap: 10,
                              }}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  marginHorizontal: 5,
                                }}>
                                {item.image && (
                                  <Image
                                    source={{uri: item.image}}
                                    style={styles.productImage}
                                  />
                                )}
                              </View>

                              <View
                                style={{
                                  flexDirection: 'column',
                                  marginHorizontal: 5, // เพิ่ม margin รอบข้างเล็กน้อยเพื่อแยกรูปภาพ
                                }}>
                                {item.badStandardImage && (
                                  <Image
                                    source={{uri: item.badStandardImage}}
                                    style={styles.productImage}
                                  />
                                )}
                              </View>
                            </View>
                          }
                          titleNumberOfLines={8}
                        />
                      </List.Accordion>
                      <List.Accordion
                        title="มาตรฐานของคุณ"
                        titleStyle={{fontSize: 16}}
                        style={{width: '100%'}}>
                        <List.Item
                          title={`${item.content}`}
                          titleNumberOfLines={8}
                        />
                      </List.Accordion>
                      <List.Accordion
                        title="ตัวอย่างที่ไม่ได้มาตรฐาน"
                        titleStyle={{color: 'red'}}>
                        <List.Item
                          title={`${item.badStandardEffect}`}
                          titleNumberOfLines={8}
                        />
                      </List.Accordion>
                    </List.Section>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  height: height * 0.5,
                  flexDirection: 'row',
                  alignContent: 'center',

                  alignItems: 'center',
                }}>
                {/* <Text style={{fontSize: 16, color: 'gray'}}>ยังไม่มีมาตรฐานการทำงาน</Text> */}
                <Button
                  onPress={() => setIsCreateStandard(true)}
                  mode="contained"
                  icon={'plus'}>
                  <Text variant="titleMedium" style={{color: 'white'}}>
                    เพิ่มมาตรฐานการทำงาน
                  </Text>
                </Button>
              </View>
            }
            keyExtractor={item => item.id}
          />
          <Modal
            isVisible={isCreateStandard}
            style={styles.modal}
            onBackdropPress={() => setIsCreateStandard(false)}>
            <CreateStandard
              isVisible={isCreateStandard}
              onClose={() => setIsCreateStandard(false)}
            />
          </Modal>
          {selectStandard && (
            <Modal
              isVisible={isUpdateModal}
              style={styles.modal}
              onBackdropPress={() => setIsUpdateModal(false)}>
              <UpdateStandard
                standard={selectStandard}
                onClose={() => setIsUpdateModal(false)}
              />
            </Modal>
          )}
        </SafeAreaView>
      )}

      {isError && (
        <Snackbar
          visible={isError}
          onDismiss={() => console.log('dismiss')}
          action={{
            label: 'Dismiss',
            onPress: () => console.log('dismiss'),
          }}>
          เกิดข้อผิดพลาด
        </Snackbar>
      )}
    </>
  );
};

export default EditStandard;
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#f5f5f5',
    width,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    backgroundColor: '#EDEDED',
    padding: 10,
    marginBottom: 30,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#323232',
    marginTop: 5,
    fontFamily: 'Sukhumvit set',
  },
  titleContainer: {
    padding: 16,

    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },
  title: {
    fontSize: 16,
    textAlign: 'left',
  },
  description: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: 'black',
  },
  auditListContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardAudit: {
    height: 200, // Set a fixed height for the CardAudit component
  },
  buttonContainer: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    bottom: 0,
    width: '100%',

    paddingBottom: 30,
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#012b20',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
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
    height: 'auto',
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
  cardAuditView: {
    height: 200,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  scrollView: {
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingHorizontal: 10,
    paddingTop: 30,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  closeButton: {
    paddingVertical: 10,
  },

  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  productImage: {
    width: 125, // Adjust the size according to your design
    height: 125, // Adjust the size according to your design
    borderRadius: 4, // If you want rounded corners
  },
});
