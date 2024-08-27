import {Company} from '@prisma/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import React, {createContext, useReducer} from 'react';

import {NotificationType} from '../types/enums';

import {QuotationSchemaType} from 'validation/collection/subcollection/quotations';
import {WarrantySchemaType} from 'validation/collection/subcollection/warranty';
import {WorkerSchemaType} from 'validation/collection/subcollection/workers';
import {ImageGallery} from '../components/gallery/existing';
import * as contrains from './constrains';

import {CompanyType} from 'validation/collection/companies';
import {MaterialSchemaType} from 'validation/collection/subcollection/materials';
import {StandardSchemaType} from 'validation/collection/subcollection/standard';
import {UserType} from 'validation/collection/users';
import {ServiceSchemaType} from 'validation/field/services';
import {ProjectImagesSchemaType} from 'validation/collection/subcollection/projectImages';
import {CategorySchemaType} from 'validation/collection/subcollection/categories';
import {QuotationEventsType} from 'validation/collection/subcollection/events';

export type StateType = {
  companyId: string;
  code: string;
  services: ServiceSchemaType[];
  existingServices: ServiceSchemaType[];
  defaultWarranty: WarrantySchemaType | null;
  quotations: QuotationSchemaType[] | null;
  editQuotation: QuotationSchemaType | null;
  editInvoice: any | null;
  editReceipt: any | null;
  editSubmission: any | null;
  viewSubmission: any | null;
  existingWorkers: WorkerSchemaType[];
  userSignature: string;
  sellerUid: string;
  fcmToken: string;
  quotationRefNumber: string;
  quotationId: string;
  G_subscription: any | null;
  G_user: UserType | null;
  G_logo: string | null;
  G_company: CompanyType | null;
  firebase_User: FirebaseAuthTypes.User | null;
  notifications: NotificationType[] | null;
  G_gallery: ProjectImagesSchemaType[];
  G_categories: CategorySchemaType[];
  G_standards: StandardSchemaType[];
  G_materials: MaterialSchemaType[];
  initial_gallery: ProjectImagesSchemaType[];
  quotations_events: QuotationEventsType[];
};

type ActionType = {
  type: string;
  payload?:
    | string
    | number
    | object
    | Company
    | NotificationType
    | null
    | undefined
    | boolean
    | UserType
    | FirebaseAuthTypes.User
    | ImageGallery[]
    | ServiceSchemaType[]
    | QuotationSchemaType[]
    | StandardSchemaType[]
    | MaterialSchemaType[]
    | WorkerSchemaType[]
    | WarrantySchemaType
    | CompanyType
    | ProjectImagesSchemaType[]
    | CategorySchemaType[]
    | QuotationEventsType[];
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
    G_gallery: [],
    G_categories: [],
    initial_gallery: [],
    G_standards: [],
    G_materials: [],
    quotations_events: [],
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
  G_gallery: [],
  G_categories: [],
  initial_gallery: [],
  G_standards: [],
  G_materials: [],
  quotations_events: [],
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case contrains.CODE:
      return {...state, code: action.payload as string};
    case contrains.GET_COMPANYID:
      return {...state, companyId: action.payload as string};
    case contrains.GET_COMPANY_STATE:
      return {...state, G_company: action.payload as CompanyType};
    case contrains.ADD_PRODUCT:
      return {
        ...state,
        services: [...state.services, action.payload as ServiceSchemaType],
      };
    case contrains.GET_EXISTING_SERVICES:
      return {
        ...state,
        existingServices: action.payload as ServiceSchemaType[],
      };
    case contrains.GET_LOGO:
      return {...state, G_logo: action.payload as string};
    case contrains.GET_DEFAULT_WARRANTY:
      return {...state, defaultWarranty: action.payload as WarrantySchemaType};
    case contrains.GET_EXISTING_WORKERS:
      return {...state, existingWorkers: action.payload as WorkerSchemaType[]};
    case contrains.GET_USER_SIGNATURE:
      return {...state, userSignature: action.payload as string};
    case contrains.GET_EDIT_QUOTATION:
      return {...state, editQuotation: action.payload as QuotationSchemaType};
    case contrains.GET_EDIT_INVOICE:
      return {...state, editInvoice: action.payload};
    case contrains.GET_EDIT_RECEIPT:
      return {...state, editReceipt: action.payload};
    case contrains.GET_EDIT_SUBMISSION:
      return {...state, editSubmission: action.payload};
    case contrains.VIEW_SUBMISSION:
      return {...state, viewSubmission: action.payload};
    case contrains.GET_SELLER_UID:
      return {...state, sellerUid: action.payload as string};
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
    case contrains.GET_SUBSCRIPTION:
      return {...state, G_subscription: action.payload};
    case contrains.GET_USER:
      return {...state, G_user: action.payload as UserType};
    case contrains.GET_FIREBASE_USER:
      return {
        ...state,
        firebase_User: action.payload as FirebaseAuthTypes.User,
      };
    case contrains.RESET_FIREBASE_USER:
      return {...state, firebase_User: null};
    case contrains.GET_NOTIFICATION:
      return {...state, notifications: action.payload as NotificationType[]};
    case contrains.GET_GALLERY:
      return {...state, G_gallery: action.payload as ProjectImagesSchemaType[]};
    case contrains.GET_QUOTATIONS:
      return {...state, quotations: action.payload as QuotationSchemaType[]};
    case contrains.GET_CATEGORIES:
      return {...state, G_categories: action.payload as CategorySchemaType[]};
    case contrains.GET_INITIAL_GALLERY:
      return {
        ...state,
        initial_gallery: action.payload as ProjectImagesSchemaType[],
      };
    case contrains.GET_STANDARD:
      return {...state, G_standards: action.payload as StandardSchemaType[]};
    case contrains.GET_MATERIAL:
      return {...state, G_materials: action.payload as MaterialSchemaType[]};
    case contrains.GET_QUOTATIONS_EVENTS:
      return {
        ...state,
        quotations_events: action.payload as QuotationEventsType[],
      };
    case contrains.UPDATE_QUOTATIONS_EVENTS:
      const updatedEvents = state.quotations_events.map(event => {
        if (
          event.quotationId ===
          (action.payload as QuotationEventsType)?.quotationId
        ) {
          return action.payload as QuotationEventsType;
        }
        return event;
      });
      return {...state, quotations_events: updatedEvents};

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
