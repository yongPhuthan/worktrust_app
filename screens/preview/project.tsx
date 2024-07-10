import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
  SafeAreaView
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import useShare from '../../hooks/webview/useShare';
import { ParamListBase } from '../../types/navigationType';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'ProjectViewScreen'>;
  route: RouteProp<ParamListBase, 'ProjectViewScreen'>;
}
const ProjectViewScreen = ({navigation, route}: Props) => {
  const {id,fileName} = route.params;
  let urlPreview = `https://project.worktrust.co/preview/seller/${id}`;
  let urlShare = `https://project.worktrust.co/preview/${id}`;
  
  const handleShare = useShare({url:urlShare, title: `ใบเสนอราคา ${fileName}`});
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
          source={{uri: urlPreview}}
        />
      </SafeAreaView>
    </>
  );
};

export default ProjectViewScreen;
