import React, { createContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectedAuditData, Standard } from '../types/docType';
import * as contrains from './constrains';
import { Service } from '../types/docType';
export type StateType = {
  companyID: string;
  code: string;
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
  },
  dispatch: () => { },
});

const initialState: StateType = {

  companyID: '',
  code: '',
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {

    case contrains.CODE:
      return { ...state, code: action.payload as string };
    case contrains.GET_COMPANYID:
      return {...state, companyID: action.payload as string};

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

  const value: ContextType = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
