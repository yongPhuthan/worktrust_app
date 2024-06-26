import {BACK_END_SERVER_URL} from '@env';
import {faChevronRight, faRemove} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useContext, useState} from 'react';

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Divider, ActivityIndicator, Appbar, Button} from 'react-native-paper';
import firebase from '../../firebase';
import {ParamListBase} from '../../types/navigationType';
import {Store} from '../../redux/store';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQuery} from '@tanstack/react-query';
import {launchImageLibrary, MediaType} from 'react-native-image-picker';
import {useUser} from '../../providers/UserContext';
import {CompanyState} from 'types';
import {Subscription, SubscriptionType, User} from '@prisma/client';
import {DrawerActions} from '@react-navigation/native';
import SelectPackages from '../../components/payment/selectPackages';
const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

interface SettingScreenProps {
  navigation: StackNavigationProp<ParamListBase, 'TopUpScreen'>;
}

const SettingsScreen = ({navigation}: SettingScreenProps) => {
  const [company, setCompany] = useState<CompanyState>();
  const [subscription, setSubscription] = useState<Subscription>();
  const user = useUser();
  const [seller, setSeller] = useState<User>();
  const {
    state: {code},
    dispatch,
  } = useContext(Store);
  const [logo, setLogo] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

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
  const fetchCompanyUser = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      const {uid} = user;
      if (!uid) {
        throw new Error('User not found');
      }
      let url = `${BACK_END_SERVER_URL}/api/company/getCompanySeller`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.statusText || 'Network response was not ok');
      }
      const data = await response.json();
      setCompany(data.company);
      setLogo(data.company.logo);
      setSeller(data.user);
      setSubscription(data.subscription);

      return data;
    }
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
  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['companySetting'],
    queryFn: fetchCompanyUser,
  });
  if (isError) {
    if (error.message === 'Subscription Expired') {
      Alert.alert('บัญชีหมดอายุ', 'กรุณาต่ออายุแพคเกจเพื่อใช้งานต่อ', [
        {
          text: 'ต่ออายุแพคเกจ',
          onPress: () => setIsVisible(true), // เปลี่ยนเป็นชื่อของหน้าที่คุณใช้สำหรับการชำระเงิน
        },
      ]);
    }
    if (error.message === 'Not Found for companySeller') {
      Alert.alert('ไม่พบข้อมูล', 'กรุณาล็อคอินอีกครั้ง', [
        {
          text: 'ตกลง',
          onPress: () => handleLogout(), // เปลี่ยนเป็นชื่อของหน้าที่คุณใช้สำหรับการชำระเงิน
        },
      ]);
    }

    // else {
    //   Alert.alert('Error', error.message);
    // }
  }

  if (!isAuthenticated) {
    return null;
  }
  if (data) {
    console.log('subscription', subscription);
  }

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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} />
        </View>
      ) : (
        <>
          {company && seller && subscription && (
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
                <View style={{flexDirection: logo ? 'row' : 'column', gap: 10}}>
                  {logo && (
                    <Image
                      source={{
                        uri: logo,
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
                  <View style={{alignItems: logo ? 'flex-start' : 'center'}}>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontWeight: '600',
                        color: '#333',
                      }}>
                      คุณ {seller?.name} {seller?.lastName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 10,

                        color: '#333',
                      }}>
                      ตำแหน่ง: {seller?.jobPosition}
                    </Text>

                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 10,

                        color: '#333',
                      }}>
                      รหัสลูกค้า : {company?.code}
                    </Text>
                    <Divider />
                    {subscription.type !== SubscriptionType.DEMO && (
                      <>
                        <Text
                          style={{
                            fontSize: 14,
                            marginBottom: 10,
                            color: '#333',
                          }}>
                          แพคเกจปัจจุบัน :{' '}
                          {subscription.type === SubscriptionType.ONEMONTH
                            ? ' 1 เดือน'
                            : subscription?.type === SubscriptionType.SIXMONTHS
                            ? ' 6 เดือน'
                            : subscription?.type === SubscriptionType.ONEYEAR
                            ? ' 1 ปี'
                            : ''}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            marginBottom: 10,

                            color: '#333',
                          }}>
                          หมดอายุ :{' '}
                          {thaiDateFormatter.format(
                            new Date(subscription.endDate),
                          )}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                {subscription.type !== SubscriptionType.DEMO && (
                  <Button
                    icon={'crown'}
                    mode={!logo ? 'contained' : 'outlined'}
                    style={{marginTop: 10}}
                    // #FFBF47
                    onPress={() => setIsVisible(true)}>
                    <Text
                      style={{
                        fontSize: 14,

                        fontWeight: 'bold',
                        color: !logo ? '#fff' : '#333',
                        //  fontFamily: 'Sukhumvit Set Bold',
                      }}>
                      ต่ออายุแพคเกจ
                    </Text>
                  </Button>
                )}
              </View>
              <View style={{backgroundColor: '#fff', marginTop: 10}}>
                {company && seller && (
                  <TouchableOpacity
                    style={{paddingVertical: 15, paddingHorizontal: 24}}
                    onPress={() =>
                      navigation.navigate('EditSetting', {company, seller})
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
      )}
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
});
