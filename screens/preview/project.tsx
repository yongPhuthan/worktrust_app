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
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'ProjectViewScreen'>;
  route: RouteProp<ParamListBase, 'ProjectViewScreen'>;
}
const ProjectViewScreen = ({navigation, route}: Props) => {
  const {id, pdfUrl, fileName} = route.params;
  const [url, setUrl] = useState(`https://www.worktrust.co/preview/${id}`);
  const [isLoading, setIsLoading] = useState(false);


  const handleShareFile = async () => {
    console.log('Share button pressed');
    let dirs = ReactNativeBlobUtil.fs.dirs;
    const type = 'application/pdf'; // MIME type
    const configOptions = {
      fileCache: true,
      path: `${dirs.DocumentDir}/${fileName}`,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        // title: `${fileName}`,
        // description: 'File downloaded by Worktrust App.',
        // mime: 'application/pdf',
      },
    };

    ReactNativeBlobUtil.config(configOptions)
      .fetch('GET', pdfUrl)
      .then(async resp => {
        let filePath = resp.path();
        let options = {
          type: type,
          url: 'file://' + filePath,
  
        };

        await Share.open(options);
        // Use ReactNativeBlobUtil's fs.unlink to remove the file after sharing
        ReactNativeBlobUtil.fs
          .unlink(filePath)
          .then(() => console.log('File deleted successfully'))
          .catch(err => console.error('Error deleting file', err));
      })
      .catch(error => {
        console.error('Error sharing', error);
      });
  };

  const handleShare = async () => {
    try {
       await Share.open({
        message: `${url}`, // ใช้ URL ที่กำหนดไว้
        url,
        title:  `Share Link ใบเสนอราคา Worktrust ${url}`,         
      });
      // ตรวจสอบผลลัพธ์ของการแชร์...
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถแชร์ได้');
    }
  };

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
            navigation.reset({
              index: 0,
              routes: [{name: 'DashboardQuotation'}],
            });
          }}
        />
        <Appbar.Content
          title="เสนอราคา"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}
        />
        <Button
          mode="outlined"
          onPress={() => {
            navigation.navigate('PDFViewScreen', {
              pdfUrl:'https://firebasestorage.googleapis.com/v0/b/worktrust-b9c02.appspot.com/o/20240422949.pdf?alt=media&token=a69310b8-5e35-4af3-8269-8f6d70742021',
              fileName,
            });
          }}>
          {'ดูสัญญา'}
        </Button>
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

      <FAB
        style={styles.fabStyle}
        icon="share-variant"
        onPress={handleShare}
        color="white"
      />
    </>
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
  button: {
    backgroundColor: '#0c5caa',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
    marginHorizontal: 5,
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
    bottom: height * 0.1,
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default ProjectViewScreen;
