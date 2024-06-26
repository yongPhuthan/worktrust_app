import React, {createContext, useReducer} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as contrains from './constrains';
import {
  Company,
  ContractsEmbed,
  Invoices,
  Quotations,
  Receipts,
  ServicesEmbed,
  Submissions,
  WarrantyEmbed,
  WorkerEmbed,
  Workers,
} from '@prisma/client';
export type StateType = {
  companyId: string;
  code: string;
  services: ServicesEmbed[];
  companyState: Company | null;
  existingServices: ServicesEmbed[];
  defaultContract: ContractsEmbed | null;
  defaultWarranty: WarrantyEmbed | null;
  editQuotation: Quotations | null;
  editInvoice: Invoices | null;
  editReceipt: Receipts | null;
  editSubmission: Submissions | null;
  viewSubmission: Submissions | null;
  logoSrc: string;
  existingWorkers: Workers[];
  userSignature: string;
  sellerId: string;
  fcmToken: string;
  quotationRefNumber: string;
  quotationId : string;
};

type ActionType = {
  type: string;
  payload: string | number | object | ServicesEmbed | ServicesEmbed[] | Company | ContractsEmbed | WarrantyEmbed | Quotations | Invoices | Receipts | null |  undefined
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
    companyState: null,
    existingServices: [],
    defaultContract: null,
    defaultWarranty: null,
    logoSrc: '',
    existingWorkers: [],
    userSignature: '',
    editQuotation: null,
    editInvoice: null,
    editReceipt: null,
    editSubmission: null,
    viewSubmission: null,
    sellerId: '',
    fcmToken:'',
    quotationRefNumber: '',
    quotationId: '',

  },
  dispatch: () => {},
});

const initialState: StateType = {
  companyId: '',
  code: '',
  services: [],
  companyState: null,
  existingServices: [],
  defaultContract: null,
  defaultWarranty: null,
  logoSrc: '',
  existingWorkers: [],
  userSignature: '',
  editQuotation: null,
  editInvoice: null,
  editReceipt: null,
  editSubmission: null,
  viewSubmission: null,
  sellerId: '',
  fcmToken:'',
  quotationRefNumber: '',
  quotationId: '',
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case contrains.CODE:
      return {...state, code: action.payload as string};
    case contrains.GET_COMPANYID:
      return {...state, companyId: action.payload as string};
    case contrains.GET_COMPANY_STATE:
      return {...state, companyState: action.payload as Company};
    case contrains.ADD_PRODUCT:
      return {
        ...state,
        services: [...state.services, action.payload as ServicesEmbed],
      };
    case contrains.GET_EXISTING_SERVICES:
      return {...state, existingServices: action.payload as ServicesEmbed[]};
    case contrains.GET_DEFAULT_CONTRACT:
      return {...state, defaultContract: action.payload as ContractsEmbed};
    case contrains.GET_LOGO:
      return {...state, logoSrc: action.payload as string};
    case contrains.GET_DEFAULT_WARRANTY:
      return {...state, defaultWarranty: action.payload as WarrantyEmbed};
    case contrains.GET_EXISTING_WORKERS:
      return {...state, existingWorkers: action.payload as Workers[]};
    case contrains.GET_USER_SIGNATURE:
      return {...state, userSignature: action.payload as string};
    case contrains.GET_EDIT_QUOTATION:
      return {...state, editQuotation: action.payload as Quotations};
    case contrains.GET_EDIT_INVOICE:
      return {...state, editInvoice: action.payload as Invoices};
    case contrains.GET_EDIT_RECEIPT:
      return {...state, editReceipt: action.payload as Receipts};
    case contrains.GET_EDIT_SUBMISSION:
      return {...state, editSubmission: action.payload as Submissions};
    case contrains.VIEW_SUBMISSION:
      return {...state, viewSubmission: action.payload as Submissions};
    case contrains.GET_SELLER_ID:
      return {...state, sellerId: action.payload as string};
    case contrains.GET_FCM_TOKEN:
      return {...state, fcmToken: action.payload as string};
    case contrains.RESET_EDIT_QUOTATION:
      return {...state, editQuotation: null};
    case contrains.RESET_EDIT_INVOICE:
      return {...state, editInvoice: null};
    case contrains.RESET_EDIT_RECEIPT:
      return {...state, editReceipt: null};
    case contrains.RESET_EDIT_SUBMISSION:
      return {...state, editSubmission: null};
    case contrains.GET_QUOTATION_REF_NUMBER:
      return {...state, quotationRefNumber: action.payload as string};
    case contrains.GET_QUOTATION_ID:
      return {...state, quotationId: action.payload as string};

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
