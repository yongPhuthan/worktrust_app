import React, { useContext, useState } from 'react';
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
import { ActivityIndicator, Appbar, Button } from 'react-native-paper';

import { useFormContext, useWatch } from 'react-hook-form';
import Modal from 'react-native-modal';
import { IServiceImage } from 'types/interfaces/ServicesEmbed';
import CustomCheckbox from '../../components/CustomCheckbox';
import { useUser } from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import { Store } from '../../redux/store';
import AddNewImage from './addNew';

interface ImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceImages: IServiceImage[];
}

interface Tag {
  id: string;
  name: string;
}

export interface ImageGallery {
  id: string;
  url: {
    thumbnailUrl: string;
    originalUrl: string;
    localPathUrl: string;
  };
  created: Date | null;
  categories: string[];
  defaultChecked: boolean;
}

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}
interface GalleryItemProps {
  item: ImageGallery;
  onPress: () => void;
  serviceImages :any
}


const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const GalleryItem: React.FC<GalleryItemProps> = React.memo(({ item, onPress, serviceImages }) => {
  const [imageUri, setImageUri] = React.useState<string | undefined>(
    item.url.localPathUrl || item.url.thumbnailUrl
  );

  console.log('serviceImages', serviceImages);

  // ตรวจสอบว่า item.id ตรงกับ _id ของรายการใน serviceImages หรือไม่
  const isChecked = React.useMemo(() => {
    return serviceImages.some(image => image._id === item.id);
  }, [item.id, serviceImages]);

  const handleError = React.useCallback(() => {
    // เมื่อเกิดข้อผิดพลาดในการโหลดรูปภาพ เราจะไม่แสดงกรอบเปล่าๆ
    setImageUri(undefined);
  }, []);

  // ถ้าไม่มี imageUri เราจะไม่แสดงคอมโพเนนต์นี้เลย
  if (!imageUri) {
    return null;
  }

  return (
    <View
      style={[
        styles.imageContainer,
        isChecked && styles.selected,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        onError={handleError}
      />
      <View style={styles.checkboxContainer}>
        <CustomCheckbox
          checked={isChecked}
          onPress={onPress}
        />
      </View>
    </View>
  );
});
const GalleryScreen = ({
  isVisible,
  onClose,
  serviceImages,
}: ImageModalProps) => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const firebaseUser = useUser();
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error('User is not available');
  }
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [initialGalleryImages, setInitialGalleryImages] = useState<
    ImageGallery[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingWebP, setIsLoadingWebP] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  // const [galleryImages, setGalleryImages] = useState<ImageGallery[]>([]);
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
    state: {code, companyId, G_gallery, G_categories, initial_gallery},
    dispatch,
  } = useContext(Store);
  const handleCheckbox = (id: string) => {
    // ค้นหา serviceImages ที่มีการเลือก (selected)
    const isSelected = G_gallery.some(img => img.id === id && serviceImages.some(serviceImg => serviceImg._id === id));
  
    let updatedServiceImages;
    if (isSelected) {
      // ถ้า id ถูกเลือกอยู่แล้ว ให้ยกเลิกการเลือก (unselect) โดยการกรองออกจาก serviceImages
      updatedServiceImages = serviceImages.filter(serviceImg => serviceImg._id !== id);
    } else {
      // ถ้า id ยังไม่ได้ถูกเลือก ให้เพิ่มเข้าไปใน serviceImages
      const selectedImage = G_gallery.find(img => img.id === id);
      if (selectedImage) {
        updatedServiceImages = [...serviceImages, selectedImage.url];
      } else {
        updatedServiceImages = [...serviceImages];
      }
    }
  
    // อัปเดตสถานะของ gallery เพื่อแสดงผลการเลือกหรือยกเลิกการเลือก
    const updatedData = G_gallery.map(img => ({
      ...img,
      defaultChecked: updatedServiceImages.some(serviceImg => serviceImg._id === img.id)
    }));
  
    // ส่งข้อมูลที่อัปเดตไปยัง store หรือ local state
    dispatch(stateAction.get_gallery(updatedData));
  
    // อัปเดตค่าของ serviceImages ในฟอร์ม
    setValue('serviceImages', updatedServiceImages, { shouldDirty: true });
  };
  const toggleTag = (tag: string) => {
    setSelectedCategories(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };


  const sortedGalleryImages = React.useMemo(() => {
    if (!G_gallery) return [];
    const validImages = G_gallery.filter(
      item => item.url && item.url.localPathUrl && item.url.thumbnailUrl,
    );
    const invalidImages = G_gallery.filter(
      item => !item.url || !item.url.localPathUrl,
    );
    return [...validImages, ...invalidImages];
  }, [G_gallery]);


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
            { isLoadingWebP ? (
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
                  {/* {sortedGalleryImages.length > 0 && (
                    <Button
                      onPress={() => setOpenFilter(true)}
                      mode="outlined"
                      icon={'tune-variant'}
                      style={{
                        width: '50%',
                        margin: 10,
                        marginTop: 20,
                      }}
                      contentStyle={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                      }}
                      children={'กรองหมวดหมู่'}
                    />
                  )} */}

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
                    renderItem={({ item }) => (
                      <GalleryItem
                      serviceImages={watch('serviceImages')}
                        item={item}
                        onPress={() => handleCheckbox(item.id)}
                      />
                    )}
                    keyExtractor={item => item.id.toString()}
                  />
                  {G_gallery.length > 0 && (
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
        {/* <FilterModal
          selectedTags={selectedCategories}
          handleSelectTag={handleFilterGalleryImages}
          isVisible={openFilter}
          onClose={() => setOpenFilter(false)}
        /> */}
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
    backgroundColor: 'white',
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
