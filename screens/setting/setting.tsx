import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useContext, useState,useEffect } from 'react';

import { SubscriptionType, User } from '@prisma/client';
import { DrawerActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Button, Divider } from 'react-native-paper';
import SelectPackages from '../../components/payment/selectPackages';
import firebase from '../../firebase';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
import { ParamListBase } from '../../types/navigationType';
const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

interface SettingScreenProps {
  navigation: StackNavigationProp<ParamListBase, 'TopUpScreen'>;
}

const getSubscriptionStyle = (type: SubscriptionType, isActive: boolean) => {
  if (!isActive) {
    return {color: 'red'};
  }

  switch (type) {
    case SubscriptionType.ONEMONTH:
      return {color: '#f0ad4e'}; // สีส้มสำหรับ 1 เดือน
    case SubscriptionType.SIXMONTHS:
      return {color: '#5bc0de'}; // สีฟ้าสำหรับ 6 เดือน
    case SubscriptionType.ONEYEAR:
      return {color: '#5cb85c'}; // สีเขียวสำหรับ 1 ปี
    default:
      return {color: '#333'}; // สีเริ่มต้น
  }
};

const SettingsScreen = ({navigation}: SettingScreenProps) => {
  const {
    state: {code, G_logo,  G_subscription, G_company,G_user},
    dispatch,
  } = useContext(Store);
  const [isVisible, setIsVisible] = useState(false);

  const subscriptionStyle = G_subscription && getSubscriptionStyle(G_subscription.type, G_subscription.isActive);
  const toggleLogoutModal = () => {
    Alert.alert(
      'Logout', // หัวข้อ
      'ยืนยันออกจากระบบ ?', // ข้อความ
      [
        {
          text: 'ยกเลิก',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'ออกจากระบบ',
          onPress: handleLogout,
        },
      ],
    );
  };


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

  return (
    <>
      <Appbar.Header
        elevated
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
          title={'ตั้งค่า'}
          titleStyle={{
            fontSize: 18,
            // fontWeight: 'bold',
          }}
        />
      </Appbar.Header>
      {G_company && G_user && G_subscription && (
            <ScrollView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
              {/* Business Details */}
              <View
                style={{
                  paddingHorizontal: 20,
                  backgroundColor: '#fff',
                  paddingVertical: 20,
                  paddingTop: 30,
                  flexDirection: 'column',
                }}>
                <View style={{flexDirection: G_logo ? 'row' : 'column', gap: 10}}>
                  {G_logo && (
                    <Image
                      source={{
                        uri: G_logo,
                      }}
                      style={{
                        alignSelf: 'center',
                        width: 100,
                        aspectRatio: 1,
                        resizeMode: 'contain',
                      }}
                    />
                  )}
                  {/* Business Name and Address */}
                  <View style={{alignItems: G_logo ? 'flex-start' : 'center'}}>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontWeight: '600',
                        color: '#333',
                      }}>
                      คุณ {G_user?.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 10,

                        color: '#333',
                      }}>
                      ตำแหน่ง: {G_user?.jobPosition}
                    </Text>

                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 10,

                        color: '#333',
                      }}>
                      รหัสลูกค้า : {code}
                    </Text>
                    <Divider />
                    {G_subscription.type !== SubscriptionType.DEMO && (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: 5,
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              marginBottom: 10,
                              color: '#333',
                            }}>
                            แพคเกจปัจจุบัน:
                          </Text>
                          <Text
                            style={[
                              styles.subscriptionText,
                              subscriptionStyle,
                            ]}>
                            {G_subscription.type === SubscriptionType.ONEMONTH
                              ? ' 1 เดือน'
                              : G_subscription.type === SubscriptionType.SIXMONTHS
                              ? ' 6 เดือน'
                              : G_subscription.type === SubscriptionType.ONEYEAR
                              ? ' 1 ปี'
                              : G_subscription.type === SubscriptionType.EXPIRED
                              ? 'หมดอายุ'
                              : ''}
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 14,
                            marginBottom: 10,

                            color: '#333',
                          }}>
                          หมดอายุ :{' '}
                          {thaiDateFormatter.format(
                            new Date(G_subscription.endDate),
                          )}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                {G_subscription.type !== SubscriptionType.DEMO && (
                  <Button
                    icon={'crown'}
                    mode={'outlined'}
                    style={{marginTop: 10}}
                    // #FFBF47
                    onPress={() => setIsVisible(true)}>
                    <Text
                      style={{
                        fontSize: 14,

                        fontWeight: 'bold',
                        color: '#333',
                        //  fontFamily: 'Sukhumvit Set Bold',
                      }}>
                      ต่ออายุแพคเกจ
                    </Text>
                  </Button>
                )}
              </View>
              <View style={{backgroundColor: '#fff', marginTop: 10}}>
                {G_company && G_user && (
                  <TouchableOpacity
                    style={{paddingVertical: 15, paddingHorizontal: 24}}
                    onPress={() =>
                      navigation.navigate('EditSetting')
                    }>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color: '#333',
                        }}>
                        แก้ไขธุรกิจ
                      </Text>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        size={18}
                        color="#aaa"
                      />
                    </View>
                  </TouchableOpacity>
                )}

                <Divider />

                <TouchableOpacity
                  onPress={() => navigation.navigate('EditWorkers')}
                  style={{paddingVertical: 15, paddingHorizontal: 24}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                      ทีมงาน
                    </Text>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      size={18}
                      color="#aaa"
                    />
                  </View>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditMaterials')}
                  style={{paddingVertical: 15, paddingHorizontal: 24}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                      วัสดุอุปกรณ์
                    </Text>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      size={18}
                      color="#aaa"
                    />
                  </View>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditStandard')}
                  style={{paddingVertical: 15, paddingHorizontal: 24}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                      มาตรฐานการทำงาน
                    </Text>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      size={18}
                      color="#aaa"
                    />
                  </View>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditGallery')}
                  style={{paddingVertical: 15, paddingHorizontal: 24}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                      รูปภาพ
                    </Text>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      size={18}
                      color="#aaa"
                    />
                  </View>
                </TouchableOpacity>
                <Divider />
                <Divider
                  style={{
                    marginTop: 50,
                  }}
                />
                <TouchableOpacity
                  style={{paddingVertical: 15, paddingHorizontal: 24}}
                  onPress={() => toggleLogoutModal()}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                      ออกจากระบบ
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          <SelectPackages
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
          />
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionText: {
    fontSize: 14,
    marginBottom: 10,
  },
});
