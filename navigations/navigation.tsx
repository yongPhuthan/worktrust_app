import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useUser} from '../providers/UserContext';
import DefaultContract from '../screens/contract/defaultContract';
import AddCustomer from '../screens/customer/addCustomer';
import AddProductForm from '../screens/products/addProduct';
import Quotation from '../screens/quotation/create';
import DocViewScreen from '../screens/quotation/webview';
import CreateCompanyScreen from '../screens/register/createcompanyScreen';
import {ParamListBase, ScreenItem} from '../types/navigationType';

import ContractOption from '../screens/contract/contractOptions';
import EditQuotation from '../screens/quotation/edit';
import EditSetting from '../screens/setting/editSetting';

import EditDefaultContract from '../screens/contract/edit/editDefaultContract';
import ExistingContract from '../screens/contract/existingContract';
import FirstAppScreen from '../screens/register/firstAppScreen';
import LoginScreen from '../screens/register/loginScreen';
import RegisterScreen from '../screens/register/registerScreen';
import SettingsScreen from '../screens/setting/setting';
import Selectworks from '../screens/submit/selectworks';
import SendWorks from '../screens/submit/sendWorks';
import Installment from '../screens/utils/installment';
import TopUpScreen from '../screens/utils/topup';
import DashboardDrawer from './dashboardDrawer';
// import BootSplash from "react-native-bootsplash";
import ContractViewScreen from '../screens/contract/webview';
import SelectDoc from '../screens/invoice/selectDoc';
import CreateNewInvoice from '../screens/invoice/create/createNew';

import SignupMobileScreen from '../screens/register/phoneAuth/signupMobile';
import LoginMobileScreen from '../screens/register/phoneAuth/loginMobileScreen';
import ProjectViewScreen from '../screens/preview/project';
import PDFViewScreen from '../screens/preview/pdf';
import CreateNewReceipt from '../screens/receipt/create/createNew';
import InvoiceDepositScreen from '../screens/deposit/invoiceDeposit';
import ReceiptDepositScreen from '../screens/deposit/receiptDeposit';
import CreateWarranty from '../screens/warranty/create';
import EditWorkers from '../screens/setting/workers/edit';
import ViewSubmission from '../screens/submit/view';
import EditMaterials from '../screens/setting/materials/edit';
import EditGallery from '../screens/setting/gallery/edit';
import EditStandard from '../screens/setting/standards/edit';
import DashboardSubmit from '../screens/submit/dashboard';

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
          component={Quotation}
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
        <Stack.Screen
          name="CreateNewInvoice"
          component={CreateNewInvoice}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'สร้างใบวางบิล',
            headerBackTitle: '',

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="CreateNewReceipt"
          component={CreateNewReceipt}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'สร้างใบเสร็จรับเงิน',
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
          name="AddProduct"
          component={AddProductForm}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'เพิ่มรายการ-สินค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

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
          name="CreateWarranty"
          component={CreateWarranty}
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
          name="TopUpScreen"
          component={TopUpScreen}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เติมเครดิต',
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
          name="SelectDoc"
          component={SelectDoc}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'เลือกเอกสาร',
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
        {/* InvoiceDepositScreen */}
        <Stack.Screen
          name="InvoiceDepositScreen"
          component={InvoiceDepositScreen}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'มัดจำใบวางบิล',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="ReceiptDepositScreen"
          component={ReceiptDepositScreen}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'มัดจำใบเสร็จรับเงิน',
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
          name="ExistingContract"
          component={ExistingContract}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'ตั้งค่าสัญญา',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

        <Stack.Screen
          name="AddCustomer"
          component={AddCustomer}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เพิ่มลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

        <Stack.Screen
          name="EditQuotation"
          component={EditQuotation}
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

        <Stack.Screen
          name="DefaultContract"
          component={DefaultContract}
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
          name="EditDefaultContract"
          component={EditDefaultContract}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขรายละเอียดสัญญา',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="ContractOptions"
          component={ContractOption}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
