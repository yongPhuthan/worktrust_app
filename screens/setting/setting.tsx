import {
  BACK_END_SERVER_URL
} from '@env';
import {
  faChevronRight, faRemove
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import {
  
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Divider,ActivityIndicator, } from 'react-native-paper';
import firebase from '../../firebase';
import { ParamListBase } from '../../types/navigationType';

import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import {
  launchImageLibrary,
  MediaType
} from 'react-native-image-picker';
import { useUser } from '../../providers/UserContext';
import { CompanyUser } from '../../types/docType';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

interface SettingScreenProps {
  navigation: StackNavigationProp<ParamListBase, 'TopUpScreen'>;
}

const SettingsScreen = ({navigation}: SettingScreenProps) => {
  const [company, setCompany] = useState<CompanyUser>();
  const user = useUser();
  const [visible, setVisible] = useState(false);


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


  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);


  const businessDetails = [
    {id: 2, title: 'Business Address', value: company?.address || ''},
  ];
  const fetchCompanyUser = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      const {email} = user;
      if (!email) {
        throw new Error('Email not found');
      }
      let url = `${BACK_END_SERVER_URL}/api/company/getCompanySeller?email=${encodeURIComponent(
        email,
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      setCompany(data.user);
      setLogo(data.user.logo);
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

      navigation.navigate('FirstAppScreen');
    } catch (error) {
      console.error('Failed to sign out: ', error);
    }
  };
  const {data, isLoading, isError,error} = useQuery({
    queryKey: ['companySetting'],
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
    return (
      <View style={styles.loadingContainer}>
        <Text>Error: {error?.message}</Text>
      </View>
    );

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
      {company && (
        <ScrollView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
          {/* Business Details */}
          <View style={{backgroundColor: '#fff', paddingVertical: 24}}>
            {/* Logo */}
            <TouchableOpacity
              style={{alignItems: 'center', marginBottom: 24}}
              onPress={handleLogoUpload}>
              {logo && logo !== 'NONE' ? (
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
                  marginBottom: 10,
                  fontWeight: '600',
                  color: '#333',
                }}>
                {company?.userName} {company?.userLastName}
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
                {company?.officeTel} {company?.mobileTel}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 10,
                  fontWeight: '600',
                  color: '#333',
                }}>
                {company?.userEmail}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 10,
                  fontWeight: '600',
                  color: '#333',
                }}>
                {company?.companyNumber}
              </Text>
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
              onPress={() => navigation.navigate('EditSetting', {company})}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  แก้ไขข้อมูลธุรกิจ
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
              </View>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={{paddingVertical: 15, paddingHorizontal: 24}}
              onPress={() => navigation.navigate('ExistingContract')}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  แก้ไขสัญญา
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
              </View>
            </TouchableOpacity>
            <Divider />
            {/* <TouchableOpacity
              style={{paddingVertical: 15, paddingHorizontal: 24}}
              onPress={() => navigation.navigate('ExistingSignature',{company} )}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  ลายเซ็น
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
              </View>
            </TouchableOpacity> */}
            {/* <Divider />
            <TouchableOpacity
              style={{paddingVertical: 15, paddingHorizontal: 24}}
              onPress={() => navigation.navigate('EditSetting', {company})}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
                  บัญชีธนาคาร
                </Text>
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
              </View>
            </TouchableOpacity>
            <Divider /> */}
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
                <FontAwesomeIcon icon={faChevronRight} size={18} color="#aaa" />
              </View>
            </TouchableOpacity>
            <View
              style={{
                width: '90%',
                alignSelf: 'center',
                borderBottomWidth: 0.3,
                borderBottomColor: '#cccccc',
              }}></View>
                          <TouchableOpacity
              style={{paddingVertical: 15, paddingHorizontal: 24}}
              onPress={showDialog}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontSize: 15, fontWeight: '400', color: 'red'}}>
                  Delete Account
                </Text>
                <FontAwesomeIcon icon={faRemove} size={16} color="red" />
              </View>
            </TouchableOpacity>
            <ConfirmDeleteDialog visible={visible} hideDialog={hideDialog} company={company.bizName} />
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
