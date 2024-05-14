import React, {createContext, useReducer} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CompanySeller,
  Contract,
  ExsistingService,
  SelectedAuditData,
  Standard,
  Warranty,
  Worker,
} from '../types/docType';
import * as contrains from './constrains';
import {Service} from '../types/docType';
export type StateType = {
  companyID: string;
  code: string;
  services: any[];
  companyState: CompanySeller | null;
  existingServices: ExsistingService[];
  defaultContract: Contract | null;
  defaultWarranty: Warranty | null;
  logoSrc: string;
  existingWorkers: Worker[];
  userSignature: string;
};

type ActionType = {
  type: string;
  payload: string | number | object;
};

type ContextType = {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
};

export const Store = createContext<ContextType>({
  state: {
    companyID: '',
    code: '',
    services: [],
    companyState: null,
    existingServices: [],
    defaultContract: null,
    defaultWarranty: null,
    logoSrc: '',
    existingWorkers: [],
    userSignature: '',
  },
  dispatch: () => {},
});

const initialState: StateType = {
  companyID: '',
  code: '',
  services: [],
  companyState: null,
  existingServices: [],
  defaultContract: null,
  defaultWarranty: null,
  logoSrc: '',
  existingWorkers: [],
  userSignature: '',
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case contrains.CODE:
      return {...state, code: action.payload as string};
    case contrains.GET_COMPANYID:
      return {...state, companyID: action.payload as string};
    case contrains.GET_COMPANY_STATE:
      return {...state, companyState: action.payload as CompanySeller};
    case contrains.ADD_PRODUCT:
      return {
        ...state,
        services: [...state.services, action.payload],
      };
    case contrains.GET_EXISTING_SERVICES:
      return {...state, existingServices: action.payload as ExsistingService[]};
    case contrains.GET_DEFAULT_CONTRACT:
      return {...state, defaultContract: action.payload as Contract};
    case contrains.GET_LOGO:
      return {...state, logoSrc: action.payload as string};
    case contrains.GET_DEFAULT_WARRANTY:
      return {...state, defaultWarranty: action.payload as Warranty};
    case contrains.GET_EXISTING_WORKERS:
      return {...state, existingWorkers: action.payload as Worker[]};
    case contrains.GET_USER_SIGNATURE:
      return {...state, userSignature: action.payload as string};

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
