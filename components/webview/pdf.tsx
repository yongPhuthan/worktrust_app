import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Appbar } from 'react-native-paper';
import Pdf from 'react-native-pdf';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';

type Props = {
  pdfUrl: string;
  fileName: string;
  onClose: () => void;
  fileType: string;
  visible: boolean;
};
const PDFModalScreen = (props: Props) => {
  const {pdfUrl, fileName, onClose, visible, fileType} = props;
  const source = {uri: pdfUrl, cache: false};

  const printRemotePDF = async () => {
    try {
      // Download the file first
      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
      }).fetch('GET', pdfUrl);

      const localFileUri = res.path(); // Get the local file path

      // Print the downloaded file
      await RNPrint.print({filePath: localFileUri});

      // Clean up the file after printing
      ReactNativeBlobUtil.fs.unlink(localFileUri);
    } catch (error) {
      console.error('Error printing PDF:', error);
    }
  };
  const downloadFile = async () => {
    try {
      let dirs = ReactNativeBlobUtil.fs.dirs;
      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: 'pdf',
        path: `${dirs.DocumentDir}/${fileType}${fileName}.pdf`,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: `${fileType}${fileName}.pdf`,
          description: 'File downloaded by Worktrust App.',
          mime: 'application/pdf',
        },
      }).fetch('GET', pdfUrl);

      if (Platform.OS === 'ios') {
        const filePath = res.path();
        const options = {
          type: 'application/pdf',
          url: 'file://' + filePath,
          fileName: `${fileType}_${fileName}.pdf`,
          saveToFiles: true,
          print: true,
        };

        Share.open(options)
          .then(resp => console.log(resp))
          .catch(err => console.log('Share Error -> ', err));
      } else {
        console.log('File downloaded at: ' + res.path());
      }
    } catch (err) {
      console.log('BLOB ERROR -> ', err);
    }
  };
  const handleShareFile = async () => {
    let dirs = ReactNativeBlobUtil.fs.dirs;
    
    const type = 'application/pdf'; // MIME type
    const configOptions = {
      fileCache: true,
      path: `${dirs.DocumentDir}/${fileType}_${fileName}.pdf`,
      
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        title: `${fileType}${fileName}.pdf`,
        description: 'File downloaded by Worktrust App.',
        mime: 'application/pdf',
      },
    };

    ReactNativeBlobUtil.config(configOptions)
      .fetch('GET', pdfUrl)
      .then(async resp => {
        let filePath = resp.path();
        let options = {
          type: type,
          url: 'file://' + filePath,
          fileName: `${fileType}_${fileName}.pdf`,

        };

        await Share.open(options);
        // Use ReactNativeBlobUtil's fs.unlink to remove the file after sharing
        ReactNativeBlobUtil.fs
          .unlink(filePath)
          .then(() => console.log('File deleted successfully'))
          .catch(err => console.error('Error deleting file', err));
      })
      .catch(error => {
        console.log('Error sharing', error);
      });
  };

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
            onPress={onClose}
      
          />
          <Appbar.Content
            title="PDF"
            titleStyle={{
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'Sukhumvit Set Bold',
            }}
          />
          <Appbar.Action
           
            icon="download"
            onPress={downloadFile}
          />
          <Appbar.Action
            
            icon="printer"
            onPress={printRemotePDF}
          />
          <Appbar.Action
         
            icon="share-variant"
            onPress={handleShareFile}
          />
        </Appbar.Header>

        <SafeAreaView style={{flex: 1}}>
          <View style={{flex: 1}}>
            <Pdf
            source={{ uri: pdfUrl, cache: false }}
              
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              trustAllCerts={false}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page: ${page}`);
              }}
              onError={error => {
                console.log(error);
              }}
              onPressLink={uri => {
                console.log(`Link pressed: ${uri}`);
              }}
              style={styles.pdf}
            />
          </View>
        </SafeAreaView>
      </Modal>
  
  );
};
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  shareButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 1,
  },
  buttonHomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
    marginLeft: 10,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'white',
    letterSpacing: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  cardStyle: {
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // Shadow for iOS
    shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  homeButton: {
    backgroundColor: '#0c5caa',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    width: 200,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
  shareButton: {
    backgroundColor: '#0c5caa',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
  homeButtonWhite: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 0.5,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  outlinedButton: {
    borderColor: '#1b52a7', // Border color
    borderWidth: 1, // Border width
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5, // Vertical padding
  },
  buttonTextOutlined: {
    color: '#1b52a7', // Text color matching the border
    fontSize: 18,
  },
  fabStyle: {
    bottom: height * 0.2,
    right: width * 0.05,
    position: 'absolute',
    backgroundColor: '#1b52a7',
  },
  fabPrint: {
    bottom: height * 0.4,
    right: width * 0.05,
    position: 'absolute',
    backgroundColor: '#1b52a7',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 10,
    height: Dimensions.get('window').height,
  },
});

export default PDFModalScreen;
