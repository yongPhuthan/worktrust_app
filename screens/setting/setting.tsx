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
import {Divider, ActivityIndicator, Appbar} from 'react-native-paper';
import firebase from '../../firebase';
import {ParamListBase} from '../../types/navigationType';
import {Store} from '../../redux/store';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQuery} from '@tanstack/react-query';
import {launchImageLibrary, MediaType} from 'react-native-image-picker';
import {useUser} from '../../providers/UserContext';
import {CompanyState} from 'types';
import {User} from '@prisma/client';
import {DrawerActions} from '@react-navigation/native';

interface SettingScreenProps {
  navigation: StackNavigationProp<ParamListBase, 'TopUpScreen'>;
}

const SettingsScreen = ({navigation}: SettingScreenProps) => {
  const [company, setCompany] = useState<CompanyState>();
  const user = useUser();
  const [seller, setSeller] = useState<User>();
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const [logo, setLogo] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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

  const businessDetails = [
    {id: 2, title: 'Business Address', value: company?.address || ''},
  ];
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
      const data = await response.json();
      setCompany(data.company);
      setLogo(data.company.logo);
      setSeller(data.user);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('dataSetting', data);
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
    queryKey: ['companySetting', code],
    queryFn: fetchCompanyUser,
  });
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (isError) {
    handleLogout();
    // firebase.auth().signOut()
    // return (
    //   <View style={styles.loadingContainer}>
    //     <Text>Error: {error?.message}</Text>
    //   </View>
    // );
  }

  // if (error instanceof Error) {
  //   // Use Alert to notify the user
  //   Alert.alert(
  //     "seesion หมดอายุ",
  //     "ลงทะเบียนเข้าใช้งานใหม่อีกครั้ง",
  //     [

  //       {
  //         text: "ตกลง",
  //         onPress: () => {
  //           firebase.auth().signOut().then(() => {
  //             navigation.navigate('FirstAppScreen');
  //           }).catch((signOutError) => {
  //             console.error("Sign out error: ", signOutError);
  //           });
  //         },
  //       }
  //     ]
  //   );
  // }

  const handleLogoUpload = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      maxWidth: 300,
      maxHeight: 300,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        if (
          response.assets &&
          response.assets.length > 0 &&
          response.assets[0].uri
        ) {
          setLogo(response.assets[0].uri);
        } else {
          console.log('No assets in response');
        }
      }
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
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
          title={'ตั้งค่า'}
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
          }}
        />
      </Appbar.Header>
      {company && seller && (
        <ScrollView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
          {/* Business Details */}
          <View style={{backgroundColor: '#fff', paddingVertical: 24}}>
            {/* Logo */}
            <TouchableOpacity
              style={{alignItems: 'center', marginBottom: 24}}
              onPress={handleLogoUpload}>
              {logo ? (
                <Image
                  source={{
                    uri: logo,
                  }}
                  style={{width: 100, aspectRatio: 1, resizeMode: 'contain'}}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#ddd',
                    borderRadius: 40,
                    alignItems: 'center',
                  }}
                />
              )}
            </TouchableOpacity>
            {/* Business Name and Address */}
            <View style={{alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: 12,
                }}>
                {company?.bizName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 5,
                  fontWeight: '600',
                  color: '#333',
                }}>
                {seller?.name} {seller?.lastName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 10,
                  fontWeight: '600',
                  color: '#333',
                }}>
                {seller?.jobPosition}
              </Text>
              {businessDetails.map(item => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    maxWidth: '92%',
                    marginBottom: 8,
                  }}>
                  <Text
                    style={{fontSize: 14, fontWeight: '600', color: '#333'}}>
                    {item.value}
                  </Text>
                </View>
              ))}
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 10,
                  fontWeight: '600',
                  color: '#333',
                }}>
                เบอร์ติดต่อ {company?.officeTel} มือถือ {company?.mobileTel}
              </Text>

              {company.companyTax && (
                <Text
                  style={{
                    fontSize: 14,
                    marginBottom: 10,
                    fontWeight: '600',
                    color: '#333',
                  }}>
                  {company?.companyTax}
                </Text>
              )}

              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 10,
                  fontWeight: '600',
                  color: '#333',
                }}>
                รหัสลูกค้า : {company?.code}
              </Text>
            </View>
          </View>
          {/* Business Name and Address */}
          {/* Account */}
          <View style={{backgroundColor: '#fff', marginTop: 10}}>
            <TouchableOpacity
              // onPress={() => {
              //   navigation.navigate('TopUpScreen', {
              //     balance: credit,
              //   });
              // }}
              style={{paddingVertical: 16, paddingHorizontal: 24}}>
              {/* <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <FontAwesomeIcon icon={faCreditCard} size={24} color="#1b72e8" />

                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      marginLeft: 10,
                      color: '#333',
                    }}>
                    เครดิต
                  </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '800',
                      color: '#1b72e8',
                      marginRight: 8,
                    }}>
                    {Number(credit)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </Text>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    size={18}
                    color="#aaa"
                  />
                </View>
              </View> */}
            </TouchableOpacity>
            <Divider />
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
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  แก้ไขธุรกิจ
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
              </View>
            </TouchableOpacity>
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
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  ทีมงาน
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
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
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  วัสดุอุปกรณ์
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
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
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  มาตรฐานการทำงาน
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
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
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  รูปภาพ
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
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
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  ออกจากระบบ
                </Text>
                {/* <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" /> */}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
