import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useContext, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator as NativeIndicator,
  View,
} from 'react-native';
import {ActivityIndicator, Appbar, Button, Checkbox} from 'react-native-paper';
import firebase from '../../../firebase';
import {useUser} from '../../../providers/UserContext';
import {useFormContext} from 'react-hook-form';
import Modal from 'react-native-modal';
import CustomCheckbox from '../../../components/CustomCheckbox';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../../types/navigationType';
import type {RouteProp} from '@react-navigation/native';
import {Store} from '../../../redux/store';
import AddNewImage from '../../../components/gallery/addNew';
import {ServiceImagesEmbed} from '@prisma/client';

interface ImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceImages: string[];
  setServiceImages: any;
}
type LoadingStatus = {
  [index: number]: boolean;
};

interface Tag {
  id: string;
  name: string;
}

interface ImageData {
  id: string;
  url: {
    thumbnailUrl: string;
    originalUrl: string;
  };
  tags: string[];
  defaultChecked: boolean;
  created : Date | null
}

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditGallery'>;
  route: RouteProp<ParamListBase, 'EditGallery'>;
}

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;

const EditGallery = ({navigation, route}: Props) => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const user = useUser();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<ImageData[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoadingWebP, setIsLoadingWebP] = useState<boolean>(false);

  const [serviceImages, setServiceImages] = useState<ServiceImagesEmbed[]>([]);
  const {
    state: {code},
    dispatch,
  } = useContext(Store);
  const handleCheckbox = (id: string) => {
    const updatedData = galleryImages.map(img => {
      if (img.id === id) {
        return {...img, defaultChecked: !img.defaultChecked};
      }
      return img;
    });
    setGalleryImages(updatedData);

    const urls = updatedData
      .filter(img => img.defaultChecked)
      .map(img => img.url);
    setServiceImages(urls);
  };
  const getGallery = async () => {
    const imagesCollectionPath = `${code}/gallery/images`;
    const imagesRef = firebase.firestore().collection(imagesCollectionPath);
  
    try {
      const imageSnapshot = await imagesRef.get();
      const images = imageSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url,
          tags: data.tags || [],
          defaultChecked: false,
          created: data.created ? data.created.toDate() : null,
        };
      });
      const tagsCollectionPath = `${code}/gallery/tags`;
      const tagsRef = firebase.firestore().collection(tagsCollectionPath);
      const tagSnapshot = await tagsRef.get();
      const fetchedTags = tagSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        created: doc.data().created ? doc.data().created.toDate() : null,
      }));
  
      // Sort images by created date, handling null cases
      images.sort((a, b) => {
        if (a.created && b.created) {
          return b.created.getTime() - a.created.getTime();
        }
        if (a.created && !b.created) {
          return -1;
        }
        if (!a.created && b.created) {
          return 1;
        }
        return 0;
      });
  
      setGalleryImages(images);
      setTags(fetchedTags); // Assuming setTags updates the state containing all tags
  
      return images; // Return images array, even if it's empty
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      return [];
    }
  };
  

  const {data, isLoading, error} = useQuery({
    queryKey: ['gallery', code],
    queryFn: getGallery,
  });

  const deleteImages = async (imageIds: string[]) => {
    setIsDeleting(true);
    const imagesCollectionPath = `${code}/gallery/images`;
    const imagesRef = firebase.firestore().collection(imagesCollectionPath);

    try {
      const batch = firebase.firestore().batch();
      imageIds.forEach(id => {
        const imageRef = imagesRef.doc(id);
        batch.delete(imageRef);
      });

      await batch.commit();
      console.log('Images deleted successfully');
      // Update local state after deletion
      setGalleryImages(prevImages =>
        prevImages.filter(img => !imageIds.includes(img.id)),
      );
    } catch (error) {
      console.error('Error deleting images:', error);
    } finally {
      setServiceImages([]);
      setIsDeleting(false);
    }
  };

  const confrimDeleteImages = async (imageIds: string[]) => {
    Alert.alert(
      `ยืนยันการลบ ${imageIds.length} รูปภาพ`,
      `คุณต้องการลบรูปภาพที่เลือก ${imageIds.length} รูป ใช่หรือไม่ ?`,
      [
        {
          text: 'ยกเลิก',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'ยืนยัน',
          onPress: () => deleteImages(imageIds),
        },
      ],
      {cancelable: false},
    );
  };


  const setInterVal15sec = () => {
    console.log('setInterval')
    setIsLoadingWebP(true)
    setInterval(() => {
      getGallery();
    }, 1500);
    setIsLoadingWebP(false)
  }
  

  return (
    <>
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`รูปผลงาน`} titleStyle={{fontSize: 18}} />
        <Appbar.Action icon={'plus'} onPress={() => setIsOpenModal(true)} />
      </Appbar.Header>

      {isLoading || isDeleting  || isLoadingWebP? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#047e6e" size={'large'} />
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <View
            style={{
              flexDirection: 'column',
              gap: 20,
              paddingBottom: '35%',
            }}>
            <FlatList
              data={galleryImages}
              numColumns={3}
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'gray',
                    fontSize: 16,
                    fontFamily: 'Sukhumvit Set',
                  }}>
                  ยังไม่มีรูปภาพ กด+เพิ่มรูปภาพ
                </Text>
              }
              renderItem={({item, index}) => (
                <View
                  style={[
                    styles.imageContainer,
                    item.defaultChecked && styles.selected,
                  ]}>
                   <Image
                      source={{uri: item.url.thumbnailUrl}}
                      style={styles.image}
                    />
                  <View style={styles.checkboxContainer}>
                    <CustomCheckbox
                      checked={item.defaultChecked}
                      onPress={() => {
                        handleCheckbox(item.id);
                      }}
                    />
                  </View>
                </View>
              )}
              keyExtractor={item => item.id.toString()}
            />
            {galleryImages.length > 0 && (
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Button
                  mode="contained"
                  buttonColor="red"
                  children={`ลบรูปภาพ ${serviceImages.length} รูป`}
                  textColor="white"
                  style={{
                    width: '80%',
                  }}
                  onPress={() => {
                    const selectedImageIds = galleryImages
                      .filter(img => img.defaultChecked)
                      .map(img => img.id);
                    confrimDeleteImages(selectedImageIds);
                  }}
                  disabled={
                    !serviceImages || serviceImages.length === 0
                  }></Button>
              </View>
            )}
          </View>

          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <Image source={{uri: selectedImage}} style={styles.modalImage} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </SafeAreaView>
      )}

      <Modal
        isVisible={isOpenModal}
        style={styles.modal}
        onBackdropPress={() => setIsOpenModal(false)}>
        <AddNewImage
          isVisible={isOpenModal}
          onClose={() => 
            setIsOpenModal(false)
            }
        />
      </Modal>
    </>
  );
};

export default EditGallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    width,
  },
  imageContainer: {
    width: imageContainerWidth,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'gray',
    margin: 5,
  },

  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  expandButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderRadius: 15,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 300,

    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  ViewButton: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    // backgroundColor: 'white',

    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    padding: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selected: {
    backgroundColor: '#F2F2F2',
  },
  buttonContainer: {
    flexDirection: 'row',

    paddingHorizontal: 20,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },
  buttonContainerEmpty: {
    flexDirection: 'column',

    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },

  uploadButton: {
    flex: 1, // Take up half the width
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 3,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  uploadMoreButton: {
    backgroundColor: '#3498DB',
  },
  uploadGalleryButton: {
    backgroundColor: '#3498DB',
    width: '60%',
    padding: 15,
    borderRadius: 5,
    shadowColor: '#000',
  },
  uploadButtonTextGalleryButton: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Sukhumvit Set Bold',
  },

  saveButton: {
    height: 50,
    backgroundColor: '#1f303cff',
  },
  tagItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 'auto',
  },
  tagText: {
    marginLeft: 8, // Space between checkbox and text
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
    fontFamily: 'Sukhumvit Set Bold',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  addButtonContainer: {
    flexDirection: 'row',
    display: 'flex',
    width: 100,
    marginBottom: 15,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0073BA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
  onCloseButton: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    // backgroundColor: '#f5f5f5',
  },

  selectButtonText: {
    fontSize: 16,
    color: '#0073BA',
    fontFamily: 'Sukhumvit set',
    marginLeft: 10,
  },

  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButton: {
    // backgroundColor: '#0073BA',
    backgroundColor: 'white',
    borderColor: '#0073BA',
    borderWidth: 1,
    borderStyle: 'dotted',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  onPlusButton: {
    paddingVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc', // Example: gray color for disabled state
    // Other styles for disabled state, if necessary
  },
});
