import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { IDefaultStandards } from '../../models/DefaultStandards';
import { Store } from '../../redux/store';

import { useFormContext } from 'react-hook-form';

import { Types } from 'mongoose';
import Modal from 'react-native-modal';
import {
  Appbar,
  Banner,
  Button,
  Checkbox,
  List,
  Snackbar,
  Text,
} from 'react-native-paper';
import useFetchStandard from '../../hooks/standard/read';
import { useUser } from '../../providers/UserContext';
import CreateStandard from './createStandard';

interface AuditModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  serviceId: string;
}

const SelectStandard = ({
  isVisible,
  onClose,
  serviceId,
  title,
  description,
}: AuditModalProps) => {
  const [showCards, setShowCards] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const [isCreateStandard, setIsCreateStandard] = useState(false);

  const user = useUser();
  const [standardDatas, setStandardDatas] = useState<
    IDefaultStandards[] | null
  >(null);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context;

  const {
    state: {G_standards},
    dispatch,
  } = useContext(Store);
  const { isLoading, isError, error, refetch} = useFetchStandard();


  useEffect(() => {
    if (G_standards) {
      setStandardDatas(G_standards);
    }
  }, [G_standards]);
  const handleSelectStandard = (standard: IDefaultStandards) => {
    const currentStandards = getValues('standards') || [];
    const standardIndex = currentStandards.findIndex(
      (standardData: IDefaultStandards) => standardData._id === standard._id,
    );
    if (standardIndex !== -1) {
      const updatedStandards = [...currentStandards];
      updatedStandards.splice(standardIndex, 1);
      setValue('standards', updatedStandards, {shouldDirty: true});
    } else {
      const updatedStandards = [
        ...currentStandards,
        {
          _id: standard._id,
          standardShowTitle: standard.standardShowTitle,
          image: standard.image,
          content: standard.content,
        },
      ];
      setValue('standards', updatedStandards, {shouldDirty: true});
    }
  };

  const handleDonePress = () => {
    if (watch('standards')?.length > 0) {
      onClose();
    }
  };

  const stardardsWithChecked =
    standardDatas?.map(standard => ({
      ...standard,
      defaultChecked: standardDatas.some(a => a?.image === standard?.image),
    })) || [];

  useEffect(() => {
    if (stardardsWithChecked) {
      setShowCards(false);
    }
  }, []);

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

        <Appbar.Content
          title={`เลือกมาตรฐานที่ต้องการเสนอ`}
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#047e6e" size={'large'} />
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <Banner
            visible={true}
            contentStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              alignSelf: 'center',
            }}>
            {`งานติดตั้ง ${title || ''}`}
          </Banner>
          <FlatList
            style={{padding: 10, paddingTop: 20}}
            data={standardDatas}
            renderItem={({item, index}) => (
              <>
                <View
                  style={[
                    styles.card,
                    (watch('standards') || []).some(
                      (standard: IDefaultStandards) => standard._id === item._id,
                    )
                      ? styles.cardChecked
                      : null,
                  ]}
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
                      }}>
                      <Checkbox.Android
                        onPress={() => handleSelectStandard(item)}
                        color="#012b20"
                        style={{
                          flexDirection: 'row-reverse',
                          alignItems: 'center',
                        }}
                        status={
                          (watch('standards') || []).some(
                            (standard: IDefaultStandards) =>
                              standard._id === item._id,
                          )
                            ? 'checked'
                            : 'unchecked'
                        }
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: 'black',
                        }}>
                        {item.standardShowTitle}
                      </Text>
                    </View>

                    <View
                      style={{flexDirection: 'column', paddingHorizontal: 10}}>
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
                                      source={{uri: item.image.thumbnailUrl}}
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
                                      source={{uri: item.badStandardImage.thumbnailUrl}}
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
                          left={props => (
                            <List.Icon
                              {...props}
                              icon="check-circle"
                              color="green"
                            />
                          )}
                          style={{width: '100%'}}>
                          <List.Item
                            title={`${item.content}`}
                            titleNumberOfLines={8}
                          />
                        </List.Accordion>
                        <List.Accordion
                          title="ตัวอย่างที่ไม่ได้มาตรฐาน"
                          titleStyle={{color: 'red'}}
                          left={props => (
                            <List.Icon
                              {...props}
                              icon="close-circle"
                              color="red"
                            />
                          )}>
                          <List.Item
                            title={`${item.badStandardEffect}`}
                            titleNumberOfLines={8}
                          />
                        </List.Accordion>
                      </List.Section>
                    </View>
                  </View>
                </View>
              </>
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
            keyExtractor={(item: IDefaultStandards) => new Types.ObjectId(item._id as string).toHexString()}
          />

          {watch('standards')?.length > 0 && (
            <Button
              style={{
                width: '90%',
                alignSelf: 'center',
                marginBottom: 20,
              }}
              mode="contained"
              onPress={handleDonePress}>
              {`บันทึก ${watch('standards')?.length} มาตรฐาน`}{' '}
            </Button>
          )}
          <Modal
            isVisible={isCreateStandard}
            style={styles.modal}
            onBackdropPress={() => setIsCreateStandard(false)}>
            <CreateStandard
              isVisible={isCreateStandard}
              onClose={() => setIsCreateStandard(false)}
            />
          </Modal>
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
    </Modal>
  );
};

export default SelectStandard;
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
