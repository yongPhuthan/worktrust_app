import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Quotation from '../screens/quotation/create';
import DocViewScreen from '../screens/quotation/webview';
import CreateCompanyScreen from '../screens/register/createcompanyScreen';
import { ParamListBase, ScreenItem } from '../types/navigationType';

import EditSetting from '../screens/setting/editSetting';

import FirstAppScreen from '../screens/register/firstAppScreen';
import LoginScreen from '../screens/register/loginScreen';
import RegisterScreen from '../screens/register/registerScreen';
import SettingsScreen from '../screens/setting/setting';
import Selectworks from '../screens/submit/selectworks';
import SendWorks from '../screens/submit/sendWorks';
import Installment from '../screens/utils/installment';
import DashboardDrawer from './dashboardDrawer';
// import BootSplash from "react-native-bootsplash";

import PDFViewScreen from '../screens/preview/pdf';
import ProjectViewScreen from '../screens/preview/project';
import LoginMobileScreen from '../screens/register/phoneAuth/loginMobileScreen';
import SignupMobileScreen from '../screens/register/phoneAuth/signupMobile';
import EditGallery from '../screens/setting/gallery/edit';
import EditMaterials from '../screens/setting/materials/edit';
import EditStandard from '../screens/setting/standards/edit';
import EditWorkers from '../screens/setting/workers/edit';
import DashboardSubmit from '../screens/submit/dashboard';
import ViewSubmission from '../screens/submit/view';
import NotificationScreen from '../screens/utils/notifications';
import CreateQuotation from '../screens/quotation/create';

const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

const Navigation = ({initialRouteName}: {initialRouteName: keyof ParamListBase | undefined}) => {
  const Stack = createNativeStackNavigator<ParamListBase>();
  const screens: ScreenItem[] = [
    {name: 'CreateCompanyScreen', component: CreateCompanyScreen},
    {name: 'RegisterScreen', component: RegisterScreen},
    {name: 'SignupMobileScreen', component: SignupMobileScreen},
    {name: 'LoginMobileScreen', component: LoginMobileScreen},
    {name: 'DocViewScreen', component: DocViewScreen},
    {name: 'FirstAppScreen', component: FirstAppScreen},
    {name: 'LoginScreen', component: LoginScreen},
    {name: 'DashboardQuotation', component: DashboardDrawer},
  ];

  const commonScreenOptions = {

    headerStyle: {
      backgroundColor: '#ffffff',
    },
    headerTintColor: 'black',
  };
  if (!initialRouteName) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={Theme}>
      {/* <NavigationContainer  onReady={() => {
      BootSplash.hide();
     }} theme={Theme}> */}
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          ...commonScreenOptions,
          headerShown: false,
        }}>
        {screens.map(({name, component}) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
        <Stack.Screen
          name="CreateQuotation"
          component={CreateQuotation}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'สร้างใบเสนอราคา',
            headerBackTitle: '',

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />


        <Stack.Screen name="PDFViewScreen" component={PDFViewScreen} />
        <Stack.Screen name="ProjectViewScreen" component={ProjectViewScreen} />

        

        <Stack.Screen
          name="SelectWorks"
          component={Selectworks}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แจ้งส่งงานลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

       
    
        <Stack.Screen
          name="SendWorks"
          component={SendWorks}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แจ้งส่งงานลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="ViewSubmission"
          component={ViewSubmission}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แจ้งส่งงานลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
         <Stack.Screen
          name="DashboardSubmit"
          component={DashboardSubmit}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แจ้งส่งงานลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="Installment"
          component={Installment}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แบ่งงวดชำระ',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

        <Stack.Screen
          name="EditSetting"
          component={EditSetting}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขข้อมูลธุรกิจ',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
              <Stack.Screen
          name="EditGallery"
          component={EditGallery}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขรูปภาพ',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
          <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขรูปภาพ',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />


        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'ตั้งค่า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

      
         <Stack.Screen
          name="EditStandard"
          component={EditStandard}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขเอกสาร',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

        <Stack.Screen
          name="EditWorkers"
          component={EditWorkers}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'รายละเอียดสัญญา',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
          />
                <Stack.Screen
          name="EditMaterials"
          component={EditMaterials}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขวัสดุ-อุปกรณ์',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
          />

       
      
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
