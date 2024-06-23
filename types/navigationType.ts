import { Company, Invoices, Quotations, ServicesEmbed, User } from '@prisma/client';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StackNavigationProp} from '@react-navigation/stack';
type InstallmentParams = {
  data: {
    projectName: string;
    signDate: string; // Adjust the type based on your actual data structure
    servayDate: string; // Same here, ensure the type matches your data
    total: number;
    signAddress: string;
    quotationId: string; // Adjust based on actual ID type (string or number)
    sellerId: string; // Adjust as needed
    contractID: string | undefined; // Assuming contract?.id can be undefined
    sellerSignature: string; // Adjust as needed
  };
};
export type Audit = {
  title: string;
  description: string;

  serviceID: string;
};

export type ProductItem = {
  title: string;
  id: string;
  description: string;
  qty: number;
  unit: string;
  total: number;
  unitPrice: number;
  discountPercent: number;
  audits: Audit[];
};
type OnAddService = (service: ServicesEmbed) => void;

export type ParamListBase = {
  Quotation: undefined;
  CreateWarranty : undefined;
  CreateNewInvoice: undefined;
  EditWorkers:undefined;
  EditMaterials:undefined;
  EditStandard:undefined;
  EditGallery:undefined;
  InvoiceDepositScreen  : undefined;
  ReceiptDepositScreen  : undefined;
  CreateNewReceipt: undefined;
  RegisterScreen: undefined;
  SignupMobileScreen  : undefined;
  LoginMobileScreen: undefined;
  OtpScreen: undefined;
  AddCustomer: undefined;
  AuditCategory: Audit;
  AddProduct: {
    onAddService: OnAddService;
    quotationId: string;
    currentValue: ServicesEmbed | null;
  };
  ProjectViewScreen : {id: string,  fileName:string};
  PDFViewScreen: {pdfUrl: string,fileName:string,fileType:string};
  ExistingContract: undefined;
  TopUpScreen: {balance: number};
  LayoutScreen: undefined;
  CreateContractScreen: {id: string};
  HomeScreen: undefined;
  CreateQuotation: undefined;
  Dashboard: undefined;
  DashBoardSubmission: undefined;
  DashboardWarranty: undefined;
  ContractCard: undefined;
  SelectAudit: Audit;
  DefaultContract: {
    data: Quotations;
  };
  EditDefaultContract: {
    data: Quotations;
    quotationId: string;
  };
  DashboardQuotation: undefined;
  SelectDoc: undefined;
  DashboardInvoice: undefined;
  DashboardReceipt: undefined;
  DashboardContract: undefined;
  DashboardSubmit: undefined;
  SelectContract: {id: string};
  EditProductForm: {
    index: number;
    currentValue: ServicesEmbed;
    update: any;
  };
  AddExistProduct: {item: ServicesEmbed};
  EditClientForm: undefined;
  EditCustomerForm: undefined;
  SettingsScreen: undefined;
  WebViewScreen: {id: string};
  DocViewScreen: {id: any};
  ContractViewScreen: {id: string};

  EditSetting: {company: Company,seller:User};
  SignUpScreen: undefined;
  LoginScreen: undefined;
  CompanyUserFormScreen: undefined;
  ExistingSignature: {
    company: Company;
  };
  ContactInfoScreen: undefined;
  Installment: InstallmentParams;
  ExistingCategories: undefined;
  GalleryScreen: {code: string | undefined};
  SettingCompany: undefined;
  GalleryUploadScreen: undefined;
  ExistingProduct: {id: string};
  ExistingMaterials: {id: string};
  AddNewMaterial: undefined;
  ExistingWorkers: {id: string};
  AddNewWorker: undefined;
  CreateCompanyScreen: undefined;
  FirstAppScreen: undefined;
  SelectWorks: {quotationId: string};
  SendWorks: undefined,
  ViewSubmission : undefined;
  Signature: {
    text: string;
    data: Quotations;
  };
  EditQuotation: {
    quotation: Quotations;
    company: Company;
    services: ServicesEmbed[];
  };
  CreateByQuotation: {
    invoice: Invoices;
    company: Company;
    services: ServicesEmbed[];
  };
  EditQuotationScreen: {id: string};
  CreateByQuotationScreen: {id: string};

  EditContractOption: {id: string};
  QuotationScreen: undefined;
  ContractOptions: {
    id: string;
    customerName: string;
    allTotal: number;
    sellerId: string;
  };
  NavigationScreen: undefined;
};

export type ScreenItem = {
  name: keyof ParamListBase;
  component: React.ComponentType<any>;
};

export interface NavigationScreen {
  navigation: NativeStackNavigationProp<ParamListBase, 'NavigationScreen'>;
}

export interface DashboardScreenProps {
  navigation: StackNavigationProp<ParamListBase, 'Dashboard'>;
}

export type ScreenName =
  | 'SignUpScreen'
  | 'CompanyUserFormScreen'
  | 'RootTab'
  | 'HomeScreen'
  | 'RegisterScreen'
  | 'FirstAppScreen'
  | 'LoginScreen'
  | 'DashboardQuotation'
  | 'CreateCompanyScreen'
  | 'SelectWorks';
