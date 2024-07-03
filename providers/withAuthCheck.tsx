// withAuthCheck.tsx
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import React, {ComponentType, useEffect, useState,useContext} from 'react';
import {ActivityIndicator, View,Alert} from 'react-native';
import UserContext from './UserContext';
import messaging from '@react-native-firebase/messaging';
import * as stateAction from '../redux/actions';
import { Store } from '../redux/store';
import { requestNotifications } from 'react-native-permissions';

function withAuthCheck<T>(WrappedComponent: ComponentType<T>) {
  return (props: T) => {
    const [loading, setLoading] = useState(true);
    const [initialRouteName, setInitialRouteName] = useState(''); // Default initial route
    const {
      dispatch,
      state: {firebase_User},
    } = useContext(Store);

    useEffect(() => {

      const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          dispatch(stateAction.get_firebase_user(currentUser));
          setLoading(false);
          const token = await messaging().getToken();
          dispatch(stateAction.get_fcm_token(token));
          setInitialRouteName(currentUser ? 'DashboardQuotation' : 'FirstAppScreen');
        } else {
         dispatch(stateAction.reset_firebase_user());
          setInitialRouteName('FirstAppScreen');
          setLoading(false);
        }
      });

      return () => {
        unsubscribe();
      };
    }, []);

    if (loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <UserContext.Provider value={firebase_User}>
        <WrappedComponent
          {...(props as T)}
          initialRouteName={initialRouteName}
        />
      </UserContext.Provider>
    );
  };
}

export default withAuthCheck;