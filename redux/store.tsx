import React, {createContext, useReducer} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import * as contrains from './constrains';
import { Company } from '@prisma/client';
import { CreateQuotationSchemaType } from 'validation/quotations/create';
import { IServiceEmbed } from 'types/interfaces/ServicesEmbed';
import { IWarrantyEmbed } from 'types/interfaces/WarrantyEmbed';
import { IQuotations } from 'models/Quotations';
import { IInvoices } from '../models/Invoices';
import { IReceipts } from '../models/Receipts';
import { ISubmissions } from '../models/Submissions';
import { ISubscription } from '../models/Subscription';
import { IUser } from 'models/User';
import { NotificationType } from 'types/enums';
import { Schema, model, Document, Types } from 'mongoose';
import { IWorkerEmbed } from 'types/interfaces/WorkerEmbed';

export type StateType = {
  companyId: Types.ObjectId | string;
  code: string;
  services: IServiceEmbed[];
  existingServices: IServiceEmbed[];
  defaultWarranty: IWarrantyEmbed | null;
  quotations : IQuotations[] | null;
  editQuotation: CreateQuotationSchemaType | null;
  editInvoice: IInvoices | null;
  editReceipt: IReceipts | null;
  editSubmission: ISubmissions | null;
  viewSubmission: ISubmissions | null;
  existingWorkers: IWorkerEmbed[];
  userSignature: string;
  sellerUid: string;
  fcmToken: string;
  quotationRefNumber: string;
  quotationId: string;
  G_subscription: ISubscription | null;
  G_user: IUser | null;
  G_logo: string | null;
  G_company: Company | null;
  firebase_User : FirebaseAuthTypes.User | null;
  notifications : NotificationType[] | null;
};

type ActionType = {
  type: string;
  payload?:
    | string
    | number
    | object
    | IServiceEmbed[]
    | Company
    | NotificationType
    | IWarrantyEmbed
    | IQuotations
    | IInvoices
    | IReceipts
    | null
    | undefined
    | boolean
    | ISubmissions
    |CreateQuotationSchemaType
};

type ContextType = {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
};

export const Store = createContext<ContextType>({
  state: {
    companyId: '',
    code: '',
    services: [],
    G_company: null,
    existingServices: [],
    defaultWarranty: null,
    G_logo: '',
    existingWorkers: [],
    userSignature: '',
    editQuotation: null,
    editInvoice: null,
    editReceipt: null,
    editSubmission: null,
    viewSubmission: null,
    sellerUid: '',
    fcmToken: '',
    quotationRefNumber: '',
    quotationId: '',
    G_subscription: null,
    G_user: null,
    firebase_User: null,
    notifications: null,
    quotations: null,
  },
  dispatch: () => {},
});

const initialState: StateType = {
  companyId: '',
  code: '',
  services: [],
  existingServices: [],
  defaultWarranty: null,
  existingWorkers: [],
  userSignature: '',
  editQuotation: null,
  editInvoice: null,
  editReceipt: null,
  editSubmission: null,
  viewSubmission: null,
  sellerUid: '',
  fcmToken: '',
  quotationRefNumber: '',
  quotationId: '',
  G_subscription: null,
  G_user: null,
  G_logo: '',
  G_company: null,
  firebase_User: null,
  notifications: null,
  quotations: null,
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case contrains.CODE:
      return {...state, code: action.payload as string};
    case contrains.GET_COMPANYID:
      return {...state, companyId: action.payload as string};
    case contrains.GET_COMPANY_STATE:
      return {...state, G_company: action.payload as Company};
    case contrains.ADD_PRODUCT:
      return {
        ...state,
        services: [...state.services, action.payload ],
      };
    case contrains.GET_EXISTING_SERVICES:
      return {...state, existingServices: action.payload };
    case contrains.GET_LOGO:
      return {...state, G_logo: action.payload as string};
    case contrains.GET_DEFAULT_WARRANTY:
      return {...state, defaultWarranty: action.payload };
    case contrains.GET_EXISTING_WORKERS:
      return {...state, existingWorkers: action.payload};
    case contrains.GET_USER_SIGNATURE:
      return {...state, userSignature: action.payload };
    case contrains.GET_EDIT_QUOTATION:
      return {...state, editQuotation: action.payload};
    case contrains.GET_EDIT_INVOICE:
      return {...state, editInvoice: action.payload };
    case contrains.GET_EDIT_RECEIPT:
      return {...state, editReceipt: action.payload };
    case contrains.GET_EDIT_SUBMISSION:
      return {...state, editSubmission: action.payload };
    case contrains.VIEW_SUBMISSION:
      return {...state, viewSubmission: action.payload };
    case contrains.GET_SELLER_UID:
      return {...state, sellerUid: action.payload };
    case contrains.GET_FCM_TOKEN:
      return {...state, fcmToken: action.payload };
    case contrains.RESET_EDIT_QUOTATION:
      return {...state, editQuotation: null};
    case contrains.RESET_EDIT_INVOICE:
      return {...state, editInvoice: null};
    case contrains.RESET_EDIT_RECEIPT:
      return {...state, editReceipt: null};
    case contrains.RESET_EDIT_SUBMISSION:
      return {...state, editSubmission: null};
    case contrains.GET_QUOTATION_REF_NUMBER:
      return {...state, quotationRefNumber: action.payload };
    case contrains.GET_QUOTATION_ID:
      return {...state, quotationId: action.payload };
    case contrains.GET_SUBSCRIPTION:
      return {...state, G_subscription: action.payload };
    case contrains.GET_USER:
      return {...state, G_user: action.payload };
    case contrains.GET_FIREBASE_USER:
      return {...state, firebase_User: action.payload};
    case contrains.RESET_FIREBASE_USER:
      return {...state, firebase_User: null};
    case contrains.GET_NOTIFICATION:
      return {...state, notifications: action.payload };
    case contrains.GET_QUOTATIONS:
      return {...state, quotations: action.payload };

    default:
      return state;
  }
}

export function StoreProvider(props: any) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // save state to AsyncStorage on state change
  React.useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('state', JSON.stringify(state));
      } catch (error) {
        console.log('Error saving state:', error);
      }
    };
    saveState();
  }, [state]);

  // load state from AsyncStorage on component mount
  React.useEffect(() => {
    const loadState = async () => {
      try {
        const storedState = await AsyncStorage.getItem('state');
        if (storedState !== null) {
          dispatch({
            type: 'LOAD_STATE',
            payload: JSON.parse(storedState),
          });
        }
      } catch (error) {
        console.log('Error loading state:', error);
      }
    };
    loadState();
  }, []);

  const value: ContextType = {state, dispatch};
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
