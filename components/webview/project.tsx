import React, { useState } from 'react';
import { Modal, SafeAreaView } from 'react-native';
import { Appbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import useShare from '../../hooks/webview/useShare';

type Props = {
  fileName: string;
  onClose: () => void;
  visible: boolean;
  url : string;
};
const ProjectModalScreen = (props: Props) => {
  const {fileName, onClose, visible, url} = props;

  const handleShare = useShare({url, title: `เสนอราคา ลูกค้า ${fileName}`});


  return (
    <Modal animationType="slide" visible={visible}>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.Action
          icon={'close'}
          onPress={() => {
            onClose();
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

     
    </Modal>
  );
};
export default ProjectModalScreen;
