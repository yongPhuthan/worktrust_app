import Slider from '@react-native-community/slider';
import { useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import Marker, { ImageMarkOptions, Position } from 'react-native-image-marker';
import Modal from 'react-native-modal';
import * as stateAction from '../../redux/actions';

import { nanoid } from 'nanoid';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Switch,
  TextInput,
} from 'react-native-paper';
import firebase from '../../firebase';
import { useUploadToCloudflare } from '../../hooks/useUploadtoCloudflare';
import { usePickImage } from '../../hooks/utils/image/usePickImage';
import useStoragePermission from '../../hooks/utils/useStoragePermission';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
import { CategorySchemaType } from '../../validation/collection/subcollection/categories';
import { ProjectImagesSchemaType } from '../../validation/collection/subcollection/projectImages';

interface ImageGallery {
  categories: CategorySchemaType[];
  image: ProjectImagesSchemaType;
}

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
}
// interface FormData {
//   selectedCategories: string[];
//   image: ServiceImagesEmbedType;
// }
interface ImageSize {
  width: number;
  height: number;
}

interface WatermarkImage {
  src: string;
  scale: number;
  position: {
    position: string;
  };
}

interface WatermarkOptions {
  backgroundImage: {
    src: string;
    scale: number;
  };
  watermarkImages: WatermarkImage[];
  scale: number;
  quality: number;
  filename: string;
}
const WatermarkPositions = [
  'ซ้าย-บน',
  'ขวา-บน',
  'กลาง-บน',
  'กลาง',
  'ขวา-ล่าง',
  'กลาง-ล่าง',
  'ซ้าย-ล่าง',
];
const AddNewImage = ({isVisible, onClose}: ExistingModalProps) => {
  const queryClient = useQueryClient();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [addNewTag, setAddNewTag] = useState(false);
  const [addWatermark, setAddWatermark] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const firebaseUser = useUser();
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error('User is not available');
  }
  const imageId = nanoid();
  const [inputValue, setInputValue] = useState<string>('');
  const [inputNewTag, setInputNewTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [applyTrigger, setApplyTrigger] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const firestore = firebase.firestore();
  const [checked, setChecked] = React.useState<string | null>(null);
  const onPermissionDenied = () => {
    setAddWatermark(false);
  };
  const {hasPermission, requestStoragePermission} =
    useStoragePermission(onPermissionDenied);
  const [watermarkPosition, setWatermarkPosition] =
    useState<string>('Bottom Right');
  const checkImageExists = (imageUri: string): Promise<boolean> => {
    return new Promise(resolve => {
      Image.getSize(
        imageUri,
        () => resolve(true),
        () => resolve(false),
      );
    });
  };

  useEffect(() => {
    // Call applyWatermark whenever the watermarkPosition changes
    if (originalImage) {
      applyWatermark();
    }
  }, [watermarkPosition]);

  const [logoScale, setLogoScale] = useState(1);

  const getImageSize = (uri: string): Promise<ImageSize> => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({width, height}),
        error => reject(error),
      );
    });
  };
  const {
    state: {code, G_logo, G_company, companyId, G_categories, G_gallery},
    dispatch,
  } = useContext(Store);
  if (!G_company) {
    return null;
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    watch,
    setValue,
    formState: {errors, isValid, isDirty},
  } = useForm<ImageGallery>({
    mode: 'onChange',
    defaultValues: {
      categories: [],
      image: {
        id: nanoid(),
        createAt: new Date(),
        originalUrl: '',
        thumbnailUrl: '',
        localPathUrl: '',
      },
    },
  });
  const image = useWatch({
    control,
    name: 'image',
  });
  const categories = useWatch({
    control,
    name: 'categories',
  });

  const {isImagePicking, pickImage} = usePickImage((uri: string) => {
    setValue('image.localPathUrl', uri, {shouldValidate: true});
    setOriginalImage(uri);
  });
  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadToCloudflare(code, 'gallery');

  const handleAddCategory = async (): Promise<
    CategorySchemaType | undefined
  > => {
    setIsLoading(true);

    try {
      // สร้างเอกสารใหม่ใน subCollection "categories" ของบริษัท
      const categoryRef = firestore
        .collection('companies')
        .doc(companyId)
        .collection('categories')
        .doc();

      const newCategory: CategorySchemaType = {
        id: categoryRef.id, // ใช้ id ที่สร้างโดย Firestore
        name: inputNewTag,
        createAt: new Date(),
        updateAt: new Date(),
      };

      // บันทึกหมวดหมู่ใหม่ลงใน Firestore
      await categoryRef.set(newCategory);

      // ล้างค่า input และปิดฟิลด์การเพิ่มหมวดหมู่ใหม่
      setInputNewTag(''); // Clear the input field
      setAddNewTag(false); // Optionally close the input field or provide feedback

      // ดึงข้อมูลหมวดหมู่ที่อัปเดตจาก subCollection "categories" ของบริษัท
      const snapshot = await firestore
        .collection('companies')
        .doc(companyId)
        .collection('categories')
        .get();
      const categories = snapshot.docs.map(
        doc => doc.data() as CategorySchemaType,
      );

      // Dispatch categories to update the state
      dispatch(stateAction.get_categories(categories));

      setIsLoading(false);
      return newCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category, please try again!');
      setIsLoading(false);
      return undefined; // ส่งคืน undefined เมื่อเกิดข้อผิดพลาด
    }
  };

  const uploadImageWithCategories = async (): Promise<void> => {
    if (!image || categories.length === 0) {
      alert(
        'Please ensure an image is selected and at least one category is chosen.',
      );
      return;
    }
    setIsLoading(true);

    try {
      if (!image.localPathUrl) {
        console.error('Image local path URL is missing.');
        alert('Image upload failed. Please try again.');
        return;
      }

      // อัปโหลดภาพและดึง URL กลับมา
      const uploadedImageUrl = await uploadImage(image.localPathUrl);
      if (
        !uploadedImageUrl ||
        !uploadedImageUrl.originalUrl ||
        !uploadedImageUrl.thumbnailUrl
      ) {
        console.error('Image upload returned null or undefined.');
        alert('Image upload failed. Please try again.');
        return;
      }

      // อัปเดตค่า URL ใน form state
      setValue('image.originalUrl', uploadedImageUrl.originalUrl, {
        shouldValidate: true,
      });
      setValue('image.thumbnailUrl', uploadedImageUrl.thumbnailUrl, {
        shouldValidate: true,
      });

      // สร้างข้อมูลของภาพที่ต้องการบันทึกลงใน Firestore
      const imageId = nanoid(); // สร้าง ID สำหรับภาพ
      const imageData: ProjectImagesSchemaType = {
        id: imageId,
        thumbnailUrl: uploadedImageUrl.thumbnailUrl,
        originalUrl: uploadedImageUrl.originalUrl,
        localPathUrl: image.localPathUrl,
        createAt: new Date(),
        categoryIds: categories.map(
          (category: CategorySchemaType) => category.id,
        ),
      };

      // บันทึกข้อมูลภาพลงใน Firestore (สามารถปรับให้ตรงกับ collection ที่ใช้)
      const imageRef = firestore
        .collection('companies')
        .doc(companyId)
        .collection('images')
        .doc(imageId);
      await imageRef.set(imageData);

      console.log('Image saved successfully with categories:', imageData);

      // อัปเดต gallery ใน state ด้วยข้อมูลใหม่ที่บันทึก
      const sortedGallery = [...G_gallery, imageData].sort((a, b) => {
        const dateA = new Date(a.createAt || new Date());
        const dateB = new Date(b.createAt || new Date());
        return dateB.getTime() - dateA.getTime();
      });

      dispatch(stateAction.get_gallery(sortedGallery));

      // ปิด modal และ reset form
      onClose();
      reset();
    } catch (error) {
      console.error('Error uploading image with categories:', error);
      alert('Error uploading image with categories, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCategory = (category: CategorySchemaType) => {
    const isSelected = categories.some((c) => c.id === category.id);
  
    if (isSelected) {
      // Unselect the category
      setValue(
        'categories',
        categories.filter((c) => c.id !== category.id)
      );
    } else {
      // Select the category
      setValue('categories', [...categories, category]);
    }
  };
  const clearWatermark = () => {
    setChecked(null);
    setValue('image.localPathUrl', originalImage ?? '', {shouldDirty: true}); // Reset to original image
  };

  const applyWatermarkImage = async (
    originalImage: string,
    watermarkPosition: string,
    brightness: number,
    imageId: string,
  ): Promise<string | undefined> => {
    if (!originalImage || !G_logo) return;

    console.log('Original image:', originalImage);

    const originalFileExists = await checkImageExists(originalImage);
    if (!originalFileExists) {
      console.error('Original image does not exist:', originalImage);
      return;
    }

    const options: ImageMarkOptions = {
      backgroundImage: {
        src: originalImage,
        scale: 1,
      },
      watermarkImages: [
        {
          src: G_logo,
          position: {
            position: getPositionBasedOn(watermarkPosition),
          },
          scale: logoScale,
          alpha: brightness,
        },
      ],
      quality: 100,
      filename: imageId,
    };

    try {
      const markedImage = await Marker.markImage(options);
      const markedImagePath = `file://${markedImage}`;

      const markedFileExists = await checkImageExists(markedImagePath);
      if (!markedFileExists) {
        console.error('Marked image does not exist:', markedImagePath);
        return;
      }

      return markedImagePath;
    } catch (error) {
      console.error('Error applying image watermark:', error);
      throw error;
    }
  };

  const applyWatermark = async () => {
    if (!originalImage) return;

    try {
      let markedImage: string | undefined;

      if (G_logo) {
        markedImage = await applyWatermarkImage(
          originalImage,
          watermarkPosition,
          brightness,
          imageId,
        );
      } else if (G_company && G_company.bizName) {
        markedImage = await applyWatermarkText(
          originalImage,
          G_company.bizName,
          watermarkPosition,
          logoScale,
          brightness,
          imageId,
        );
      }

      if (markedImage) {
        const markedFileExists = await checkImageExists(markedImage);
        if (markedFileExists) {
          setValue('image.localPathUrl', markedImage, {shouldDirty: true});
        } else {
          console.error(
            'Marked image does not exist after watermark applied:',
            markedImage,
          );
          Alert.alert('Error', 'Failed to add watermark.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add watermark.');
    }
  };

  function getPositionBasedOn(watermarkPosition: string): Position {
    switch (watermarkPosition) {
      case 'กลาง':
        return Position.center;
      case 'ซ้าย-บน':
        return Position.topLeft;
      case 'กลาง-บน':
        return Position.topCenter;
      case 'ขวา-บน':
        return Position.topRight;
      case 'ซ้าย-ล่าง':
        return Position.bottomLeft;
      case 'กลาง-ล่าง':
        return Position.bottomCenter;
      case 'ขวา-ล่าง':
        return Position.bottomRight;
      default:
        return Position.bottomRight;
    }
  }
  const handleSwitchChange = (value: boolean) => {
    if (value && !hasPermission) {
      requestStoragePermission();
    }
    setAddWatermark(value);
    if (!value) {
      clearWatermark();
    } else {
      applyWatermark();
    }
  };
  const applyWatermarkText = async (
    originalImage: string,
    companyName: string,
    watermarkPosition: string,
    logoScale: number,
    brightness: number,
    imageId: string,
  ) => {
    if (!originalImage || !companyName) return;

    const options = {
      backgroundImage: {
        src: originalImage,
        scale: 1,
      },
      watermarkTexts: [
        {
          text: companyName,
          position: {
            position: getPositionBasedOn(watermarkPosition),
          },
          style: {
            color: '#000000',
            fontSize: 24 + 200 * logoScale,
            fontName: 'Sukhumvit set',

            // textBackgroundStyle: {
            //   padding: '2%',
            //   color: '#ffffff',
            //   cornerRadius: {
            //     topLeft: {
            //       x: '10%',
            //       y: '10%',
            //     },
            //     topRight: {
            //       x: '10%',
            //       y: '10%',
            //     },
            //   },
            // },
          },
        },
      ],
      scale: logoScale,
      quality: 100,
      filename: imageId,
    };

    try {
      const markedImage = await Marker.markText(options);
      return markedImage;
    } catch (error) {
      console.error('Error applying text watermark:', error);
      throw error;
    }
  };
  console.log('selectedCategories', categories);
  return (
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
          title={`เพิ่มรูปภาพใหม่`}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <Button
          loading={isImageUpload || isUploading || isLoading}
          disabled={!image || !categories || categories.length === 0}
          mode="contained"
          onPress={() => {
            uploadImageWithCategories();
          }}>
          บันทึก
        </Button>
      </Appbar.Header>
      {isLoading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator />
        </View>
      )}
      <FlatList
        style={styles.container}
        ListHeaderComponent={
          <>
            <Controller
              control={control}
              name="image"
              rules={{required: 'Image is required'}}
              render={({field: {onChange, value}}) => (
                <TouchableOpacity
                  onPress={() => pickImage()}
                  style={styles.imageView}>
                  {value?.localPathUrl ? (
                    isImagePicking ? (
                      <View style={styles.imageUploader}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <Image
                        source={{uri: value.localPathUrl ?? ''}}
                        style={styles.image}
                      />
                    )
                  ) : isImagePicking ? (
                    <View style={styles.imageUploader}>
                      <ActivityIndicator />
                    </View>
                  ) : (
                    <View style={styles.imageUploader}>
                      <IconButton
                        size={40}
                        icon="image-plus"
                        iconColor={'#047e6e'}
                      />
                      <Text
                        style={{
                          textAlign: 'center',
                          color: '#047e6e',
                        }}>
                        เพิ่มรูปผลงานของคุณ
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
            <Divider style={{marginVertical: 10}} />
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.label}>เลือกหมวดหมู่</Text>
              <Button
                icon={'plus'}
                onPress={() => setAddNewTag(!addNewTag)}
                style={{
                  width: '50%',
                }}>
                เพิ่มหมวดหมู่
              </Button>
            </View>
          </>
        }
        data={G_categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <>
            <View style={styles.chipContainer}>
              <Chip
                mode={categories.some((c) => c.id === item.id) ? 'outlined' : 'flat'}
                selected={categories.some((c) => c.id === item.id)}
                onPress={() => handleSelectCategory(item)}
                textStyle={
                  categories.some((c) => c.id === item.id) && styles.selectedChipText
                }>
                {item.name}
              </Chip>
            </View>
          </>
        )}
        numColumns={2}
        ListFooterComponent={
          <>
            <Divider style={{marginVertical: 10}} />

            {addNewTag && (
              <Modal
                isVisible={addNewTag}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                onBackdropPress={() => {
                  setAddNewTag(false);
                  setInputNewTag('');
                }}
                onBackButtonPress={() => {
                  setAddNewTag(false);
                  setInputNewTag('');
                }}
                style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TextInput
                    placeholder="เช่น สีดำด้าน..."
                    label={'เพิ่มหมวดหมู่ของรูปภาพนี้'}
                    mode="outlined"
                    style={{width: '80%'}}
                    textAlignVertical="top"
                    value={inputNewTag}
                    onChangeText={setInputNewTag}
                  />
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="text"
                      onPress={() => {
                        setAddNewTag(false);
                        setInputNewTag('');
                      }}>
                      ยกเลิก
                    </Button>
                    <Button
                      mode="contained"
                      disabled={isLoading || !inputNewTag}
                      loading={isLoading}
                      onPress={() => handleAddCategory()}>
                      บันทึก
                    </Button>
                  </View>
                </View>
              </Modal>
            )}
            <View
              style={{
                paddingBottom: 200,
              }}>
              <View style={styles.row}>
                <Text style={styles.signHeader}>เพิ่มโลโก้</Text>
                <Switch
                  trackColor={{false: '#a5d6c1', true: '#4caf82'}}
                  thumbColor={addWatermark ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={handleSwitchChange}
                  value={addWatermark ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              {addWatermark && (
                <>
                  <FlatList
                    data={WatermarkPositions}
                    horizontal={true}
                    ItemSeparatorComponent={() => <View style={{width: 10}} />}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => (
                      <View style={styles.checkBoxContainer}>
                        <Checkbox.Android
                          status={checked === item ? 'checked' : 'unchecked'}
                          onPress={() => {
                            setChecked(item);
                            setWatermarkPosition(item);
                          }}
                        />
                        <Text>{item}</Text>
                      </View>
                    )}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <Text style={styles.signHeader}>ปรับขนาด</Text>
                    <Slider
                      style={{width: '50%', height: 40}}
                      minimumValue={0.01}
                      maximumValue={0.3}
                      value={logoScale}
                      onValueChange={value => setLogoScale(value)}
                      onSlidingComplete={debounce(applyWatermark, 1000)}
                      minimumTrackTintColor="#4caf82"
                      maximumTrackTintColor="#a5d6c1"
                      thumbTintColor="#4caf82"
                    />
                  </View>
                  {G_logo && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <Text style={styles.signHeader}>ความสว่าง</Text>
                      <Slider
                        style={{width: '50%', height: 40}}
                        minimumValue={0.1}
                        maximumValue={1}
                        value={brightness}
                        onValueChange={value => setBrightness(value)}
                        onSlidingComplete={debounce(applyWatermark, 1000)}
                        minimumTrackTintColor="#4caf82"
                        maximumTrackTintColor="#a5d6c1"
                        thumbTintColor="#4caf82"
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        }
      />
    </>
  );
};
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
    backgroundColor: '#ffffff',
    width: windowWidth,
    height: windowHeight,
  },
  imageView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 'auto',
    maxHeight: windowHeight * 0.6,
  },
  imageUploader: {
    alignItems: 'center',
    justifyContent: 'center',
    height: windowHeight * 0.3,
    width: windowWidth * 0.9,
    borderColor: '#047e6e',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: windowHeight * 0.7,
    resizeMode: 'contain',
    margin: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  closeButton: {
    paddingVertical: 10,
  },
  modal: {
    margin: 0,
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalMedium: {
    width: windowWidth,
    height: 'auto',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerModal: {
    flex: 1,
    padding: 16,
  },
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    height: '40%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: '20%',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#012b20',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  row: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signHeader: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 16,
    color: '#19232e',
  },
  chipContainer: {
    margin: 4,
  },
  chip: {
    backgroundColor: '#e0e0e0',
  },
  selectedChipText: {
    color: 'black',
  },
});

export default AddNewImage;
