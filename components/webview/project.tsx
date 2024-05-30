import React, {useState} from 'react';
import {Alert, Dimensions, Modal, SafeAreaView, StyleSheet} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Appbar, Button, FAB} from 'react-native-paper';
import Share from 'react-native-share';
import {WebView} from 'react-native-webview';
import PDFModalScreen from './pdf';
import useShare from '../../hooks/webview/useShare';

type Props = {
  quotationId: string;  
  fileName: string;
  onClose: () => void;
  visible: boolean;
};
const ProjectModalScreen = (props: Props) => {
  const {quotationId,fileName, onClose, visible} = props;
  const [url, setUrl] = useState(
    `https://www.worktrust.co/preview/${quotationId}`,
  );
  const [showPdf, setShowPdf] = useState(false);
  const handleShare = useShare({url, title: `ใบเสนอราคา ${fileName}`});


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

      {/* <FAB
        style={styles.fabStyle}
        icon="share-variant"
        onPress={handleShare}
        color="white"
      />
      <PDFModalScreen
        pdfUrl={pdfUrl}
        fileName={fileName}
        visible={showPdf}
        onClose={() => setShowPdf(false)}
      /> */}
    </Modal>
  );
};
const {width, height} = Dimensions.get('window');

// const styles = StyleSheet.create({
//   shareButtonContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 70,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     marginVertical: 10,
//   },
//   button: {
//     backgroundColor: '#0c5caa',
//     paddingHorizontal: 30,
//     paddingVertical: 10,
//     borderRadius: 5,
//     elevation: 2, // for Android
//     shadowColor: '#000', // for iOS
//     shadowOffset: {width: 0, height: 2}, // for iOS
//     shadowOpacity: 0.25, // for iOS
//     shadowRadius: 3.84, // for iOS
//     marginHorizontal: 5,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginRight: 8,
//     marginTop: 1,
//   },
//   buttonHomeText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 8,
//     color: 'black',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   icon: {
//     color: 'white',
//     marginLeft: 10,
//   },
//   buttonRow: {
//     position: 'absolute',
//     bottom: 10,
//     flexDirection: 'row',
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 70,
//     backgroundColor: 'white',
//     letterSpacing: 10,
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   cardStyle: {
//     // borderTopLeftRadius: 20,
//     // borderTopRightRadius: 20,
//     // Shadow for iOS
//     shadowColor: '#000',
//     // shadowOffset: {
//     //   width: 0,
//     //   height: 2,
//     // },
//     shadowOpacity: 0.25,
//     // shadowRadius: 3.84,
//   },
//   homeButton: {
//     backgroundColor: '#0c5caa',
//     paddingHorizontal: 30,
//     paddingVertical: 10,
//     borderRadius: 5,
//     width: 200,
//     elevation: 2, // for Android
//     shadowColor: '#000', // for iOS
//     shadowOffset: {width: 0, height: 2}, // for iOS
//     shadowOpacity: 0.25, // for iOS
//     shadowRadius: 3.84, // for iOS
//   },
//   shareButton: {
//     backgroundColor: '#0c5caa',
//     paddingHorizontal: 30,
//     paddingVertical: 10,
//     borderRadius: 5,
//     elevation: 2, // for Android
//     shadowColor: '#000', // for iOS
//     shadowOffset: {width: 0, height: 2}, // for iOS
//     shadowOpacity: 0.25, // for iOS
//     shadowRadius: 3.84, // for iOS
//   },
//   homeButtonWhite: {
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 30,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 5,
//     borderWidth: 0.5,
//     elevation: 2, // for Android
//     shadowColor: '#000', // for iOS
//     shadowOffset: {width: 0, height: 2}, // for iOS
//     shadowOpacity: 0.25, // for iOS
//     shadowRadius: 3.84, // for iOS
//   },
//   fab: {
//     position: 'absolute',
//     margin: 16,
//     right: 0,
//     bottom: 0,
//   },
//   outlinedButton: {
//     borderColor: '#1b52a7', // Border color
//     borderWidth: 1, // Border width
//     borderRadius: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 5, // Vertical padding
//   },
//   buttonTextOutlined: {
//     color: '#1b52a7', // Text color matching the border
//     fontSize: 18,
//   },
//   fabStyle: {
//     bottom: height * 0.1,
//     right: width * 0.05,
//     position: 'absolute',
//     backgroundColor: '#1b52a7',
//   },
//   fabPrint: {
//     bottom: height * 0.4,
//     right: width * 0.05,
//     position: 'absolute',
//     backgroundColor: '#1b52a7',
//   },
//   pdf: {
//     flex: 1,
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height,
//   },
// });

export default ProjectModalScreen;
