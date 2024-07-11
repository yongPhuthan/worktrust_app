import {useQuery} from '@tanstack/react-query';
import React, {useContext, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ActivityIndicator, Appbar, Button, Checkbox} from 'react-native-paper';
import firebase from '../../firebase';
import {useUser} from '../../providers/UserContext';

import {ServiceImagesEmbed} from '@prisma/client';
import {useFormContext} from 'react-hook-form';
import Modal from 'react-native-modal';
import CustomCheckbox from '../../components/CustomCheckbox';
import {Store} from '../../redux/store';
import AddNewImage from './addNew';
import FilterModal from './filterModal';

interface ImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceImages: ServiceImagesEmbed[];
}

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
}

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;

const GalleryScreen = ({
  isVisible,
  onClose,
  serviceImages,
}: ImageModalProps) => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // const [galleryImages, setGalleryImages] = useState<ImageData[]>([]);
  // const [initialGalleryImages, setInitialGalleryImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const [initialGalleryImages, setInitialGalleryImages] = useState<ImageData[]>(
    [],
  );
  const [isLoadingWebP, setIsLoadingWebP] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [galleryImages, setGalleryImages] = useState<ImageData[]>([]);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context;
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
    setValue('serviceImages', urls, {shouldDirty: true});
  };
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };
  const getGallery = async () => {
    const imagesCollectionPath = `${code}/gallery/images`;
    const imagesRef = firebase.firestore().collection(imagesCollectionPath);

    try {
      const imageSnapshot = await imagesRef.get();
      const serviceImageUrls = new Set(
        serviceImages.map(img => img.thumbnailUrl),
      );

      const images = imageSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url,
          tags: data.tags || [],
          defaultChecked: serviceImageUrls.has(data.url.thumbnailUrl),
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
      setInitialGalleryImages(images);
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

  const handleFilterGalleryImages = (id: string): void => {
    const newSelectedTags = selectedTags.includes(id)
      ? selectedTags.filter(tagId => tagId !== id) // Toggle off if already selected
      : [...selectedTags, id]; // Add to selection if not currently selected
    setSelectedTags(newSelectedTags);

    // Filter gallery images based on AND logic for multiple tags
    if (newSelectedTags.length > 0) {
      const filteredImages = initialGalleryImages.filter(image =>
        newSelectedTags.every(tag => image.tags.includes(tag)),
      );
      setGalleryImages(filteredImages);
      setValue('serviceImages', [], {shouldDirty: true});
    } else {
      // No tags are selected, show all images
      setGalleryImages(initialGalleryImages);
      setValue('serviceImages', [], {shouldDirty: true});
    }
  };

  const sortedGalleryImages = React.useMemo(() => {
    if (!galleryImages) return [];
    const validImages = galleryImages.filter(
      item => item.url && item.url.thumbnailUrl,
    );
    const invalidImages = galleryImages.filter(
      item => !item.url || !item.url.thumbnailUrl,
    );
    return [...validImages, ...invalidImages];
  }, [galleryImages]);

  return (
    <>
      <Modal
        isVisible={isVisible}
        style={styles.modal}
        onBackdropPress={onClose}>
        {isImageUpload ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" />
          </View>
        ) : (
          <>
            <Appbar.Header
              mode="center-aligned"
              elevated
              style={{
                backgroundColor: 'white',
                width: Dimensions.get('window').width,
              }}>
              <Appbar.Action icon={'close'} onPress={() => onClose()} />
              <Appbar.Content
                title={`เลือกภาพผลงาน`}
                titleStyle={{fontSize: 18}}
              />
              <Appbar.Action
                icon={'plus'}
                onPress={() => setIsOpenModal(true)}
              />
            </Appbar.Header>
            {isLoading || isLoadingWebP ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#047e6e" size={'large'} />
              </View>
            ) : (
              <SafeAreaView style={styles.container}>
                <View
                  style={{
                    flexDirection: 'column',
                    gap: 10,
                    paddingBottom: '35%',
                  }}>
                  {sortedGalleryImages.length > 0 && (
                     <Button
                     onPress={() => setOpenFilter(true)}
                     mode="outlined"
                     icon={'tune-variant'}
                     style={{
                       width: '50%',
                       marginVertical: 5,
                     }}
                     contentStyle={{
                       flexDirection: 'row-reverse',
                       justifyContent: 'space-between',
                     }}
                     children={'กรองหมวดหมู่'}
                   />
                  )}
                 

                  <FlatList
                    data={sortedGalleryImages}
                    numColumns={3}
                    ListEmptyComponent={
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'flex-start',
                          height: height,
                          width: width,

                          alignItems: 'center',
                        }}>
                        <Image
                          source={require('../../assets/images/Catalogue-pana.png')}
                          width={width * 0.5}
                          height={height * 0.3}
                          style={{
                            width: width * 0.5,
                            height: height * 0.3,
                          }}
                        />
                        <Text style={{marginTop: 10, color: 'gray'}}>
                          ยังไม่ได้เพิ่มรูปภาพผลงาน
                        </Text>
           
                      </View>
                    }
                    renderItem={({item}) => {
                      if (!item.url || !item.url.thumbnailUrl) {
                        return null; // ไม่แสดงผลถ้า url หรือ thumbnailUrl เป็น null
                      }
                      return (
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
                      );
                    }}
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
                        style={{
                          width: '80%',
                        }}
                        onPress={() => {
                          if (serviceImages) onClose();
                        }}
                        disabled={
                          !watch('serviceImages') ||
                          watch('serviceImages').length === 0
                        }>
                        บันทึก {watch('serviceImages').length} รูป
                      </Button>
                    </View>
                  )}
                </View>

                <Modal
                  isVisible={modalVisible}
                  onBackdropPress={() => setModalVisible(false)}>
                  <View style={styles.modalContainer}>
                    <Image
                      source={{uri: selectedImage}}
                      style={styles.modalImage}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}>
                      <Text>Close</Text>
                    </TouchableOpacity>
                  </View>
                </Modal>
              </SafeAreaView>
            )}
          </>
        )}
        <Modal
          isVisible={isOpenModal}
          style={styles.modal}
          onBackdropPress={() => setIsOpenModal(false)}>
          <AddNewImage
            isVisible={isOpenModal}
            onClose={() => {
              setIsOpenModal(false);
            }}
          />
        </Modal>
        <FilterModal
          selectedTags={selectedTags}
          handleSelectTag={handleFilterGalleryImages}
          isVisible={openFilter}
          onClose={() => setOpenFilter(false)}
          tags={tags}
        />
      </Modal>
    </>
  );
};

export default GalleryScreen;

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
