import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import {FAB, Appbar, Button} from 'react-native-paper';
import {WebView} from 'react-native-webview';
import {ParamListBase} from '../../types/navigationType';
import Share from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';
import useShare from '../../hooks/webview/useShare';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'ProjectViewScreen'>;
  route: RouteProp<ParamListBase, 'ProjectViewScreen'>;
}
const ProjectViewScreen = ({navigation, route}: Props) => {
  const {id,fileName} = route.params;
  const [url, setUrl] = useState(`https://www.worktrust.co/preview/${id}`);
  const handleShare = useShare({url, title: `ใบเสนอราคา ${fileName}`});
  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title="Project view"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}
        />
        <Appbar.Action
          icon={'share-variant'}
          onPress={() => {
            handleShare();
          }}
        />
      </Appbar.Header>
      <SafeAreaView style={{flex: 1}}>
        <WebView
          onLoadStart={() => console.log('WebView loading started')}
          onLoadEnd={() => console.log('WebView loading finished')}
          onError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
          }}
          onHttpError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.error('HTTP error status code: ', nativeEvent.statusCode);
          }}
          source={{uri: url}}
        />
      </SafeAreaView>
    </>
  );
};

export default ProjectViewScreen;
