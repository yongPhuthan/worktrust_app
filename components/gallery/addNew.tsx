import Slider from '@react-native-community/slider';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {debounce} from 'lodash';
import React, {useContext, useEffect, useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import Marker, {ImageMarkOptions, Position} from 'react-native-image-marker';
import Modal from 'react-native-modal';
import {BACK_END_SERVER_URL} from '@env';
import {yupResolver} from '@hookform/resolvers/yup';
import * as stateAction from '../../redux/actions';

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
import {nanoid} from 'nanoid';
import firebase from '../../firebase';
import {useUploadToCloudflare} from '../../hooks/useUploadtoCloudflare';
import {usePickImage} from '../../hooks/utils/image/usePickImage';
import useStoragePermission from '../../hooks/utils/useStoragePermission';
import {Store} from '../../redux/store';
import { useUser } from '../../providers/UserContext';

import { ServiceImagesEmbedType } from '../../validation/quotations/create';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryKeyType } from '../../types/enums';
import { ImageGallery } from './existing';
import { IServiceImage } from 'types/interfaces/ServicesEmbed';

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
  const [initialCategories, setInitialCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applyTrigger, setApplyTrigger] = useState(false);
  const [brightness, setBrightness] = useState(1);

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
    state: {code, G_logo, G_company, companyId},
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
      id: nanoid(),
      defaultChecked : false,
      categories: [],
      images: {
        
        originalUrl: '',
        thumbnailUrl: '',
        localPathUrl: '', 
         
      },
      created: new Date(),
    },
  });
  const images = useWatch({
    control,
    name: 'images',
  });
  const categories = useWatch({
    control,
    name: 'categories',
  });
  const fetchCategories = async () => {

    const token = await firebaseUser.getIdToken(true);
    try {
      const response = await fetch(`${BACK_END_SERVER_URL}/api/gallery/getCategories?companyId=${encodeURIComponent(
          companyId.toString(),
        )}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,

        },
      });
      console.log('response', response);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch categories');
      }
  
      const categoriesData = await response.json();
      const categories = categoriesData.map((category: { name: string }) => category.name);
  
      // Successfully fetched categories, now reset the form
      setInitialCategories(categories);
  
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Handle the error appropriately, perhaps setting an error state or showing a message
      throw error; // Re-throwing the error if you need further error handling upstream
    }
  };

  const {
    data,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  const {isImagePicking, pickImage} = usePickImage((uri: string) => {
    setValue('images.localPathUrl', uri, {shouldValidate: true});
    setOriginalImage(uri);
  });

  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadToCloudflare(code, 'gallery');

  // const handleAddTag = async () => {
  //   setIsLoading(true);
  //   const tagsCollectionPath = `${code}/gallery/tags`;
  //   const tagRef = firebase
  //     .firestore()
  //     .collection(tagsCollectionPath)
  //     .doc(inputNewTag);

  //   try {
  //     // Create a new tag with the current date and an empty image array
  //     await tagRef.set({
  //       name: inputNewTag,
  //       date: new Date(), // Store the current date and time of tag creation
  //       images: [], // Empty array for future image URLs
  //     });

  //     setInputNewTag(''); // Clear the input field
  //     setAddNewTag(false); // Optionally close the input field or provide feedback

  //     // Invalidate queries related to the gallery or tags to refresh the data
  //     queryClient.invalidateQueries({
  //       queryKey: ['tags'],
  //     });
  //     setIsLoading(false);
  //   } catch (error) {
  //     // Handle errors, such as displaying a user-friendly error message
  //     console.error('Failed to add tag:', error);
  //     alert('Failed to add tag, please try again!');
  //     setIsLoading(false);
  //   }
  // };
  const handleAddCategory = async () => {
    setIsLoading(true);
    const token = await firebaseUser.getIdToken(true);

    try {
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/gallery/createCategory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({name: inputNewTag, companyId}),
        },
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to create category');
      }

      const savedCategory = await response.json();

      setInputNewTag(''); // Clear the input field
      setAddNewTag(false); // Optionally close the input field or provide feedback

      // Invalidate queries related to the gallery or tags to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['categories'], // Adjust query key as needed
      });

      setIsLoading(false);
      return savedCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category, please try again!');
      setIsLoading(false);
    }
  };


  const uploadImageWithCategories = async (): Promise<void> => {
    if (!images || categories.length === 0) {
      alert(
        'Please ensure an image is selected and at least one category is chosen.',
      );
      return;
    }
    setIsLoading(true);
    const token = await firebaseUser.getIdToken(true);

    try {
      if(!images.localPathUrl) {
        console.error('Image local path URL is missing.');
        alert('Image upload failed. Please try again.');
        return;
      }
      const uploadedImageUrl = await uploadImage(images.localPathUrl);
      if (!uploadedImageUrl || !uploadedImageUrl.originalUrl || !uploadedImageUrl.thumbnailUrl) {
        console.error('Image upload returned null or undefined.');
        alert('Image upload failed. Please try again.');
        return;
      }
      setValue('images.originalUrl', uploadedImageUrl.originalUrl, {shouldValidate: true});
      setValue('images.thumbnailUrl', uploadedImageUrl.thumbnailUrl, {shouldValidate: true});

      console.log("Image UPDATE successfully:", images);

      // Save the image with categories to the server via API call
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/gallery/addImagesToCategory`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,

          },
          body: JSON.stringify({
             url: images,
            categories, // ส่งรายการ category ที่เลือกไปยังเซิร์ฟเวอร์
          }),
        },
      );
      // console.log('response', response);

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.error || 'Failed to save image with categories',
        );
      }
     const galleryStorage = await AsyncStorage.getItem(QueryKeyType.GALLERY);
      let galleryData = [];
      if(galleryStorage) {
        try {
          galleryData = JSON.parse(galleryStorage);
        } catch (parseError) {
          console.error('Error parsing gallery data:', parseError);
          await AsyncStorage.removeItem(QueryKeyType.GALLERY);
          galleryData = [];
        }
      }
      const existingGallery = galleryData.find(
        (q:IServiceImage) => q.thumbnailUrl === images.url?.thumbnailUrl,
      );
      if (!existingGallery) {
        galleryData.push(images);
      } else {
        console.log('Image already exists in gallery.', existingGallery);

      }
      const sortedGalllery = galleryData.sort((a : IServiceImage, b:IServiceImage) => {
        const dateA = new Date(a.created || new Date());
        const dateB = new Date( b.created || new Date());
        return dateB.getTime() - dateA.getTime();
      });
      await AsyncStorage.setItem(QueryKeyType.GALLERY, JSON.stringify(sortedGalllery));
dispatch(stateAction.get_gallery(sortedGalllery));

      onClose();
      reset();
    } catch (error) {
      console.error('Error uploading image with categories:', error);
      alert('Error uploading image with categories, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTag = (tag: string) => {
    if (categories.includes(tag)) {
      setValue(
        'categories',
        categories.filter(t => t !== tag),
      ); // Unselect the tag
    } else {
      setValue('categories', [...categories, tag]); // Select the tag
    }
  };
  const clearWatermark = () => {
    setChecked(null);
    setValue('images.localPathUrl', originalImage ?? '', {shouldDirty: true}); // Reset to original image
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
      console.log('Marked image path:', markedImagePath);

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
          setValue('images.localPathUrl', markedImage, {shouldDirty: true});
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
          loading={isImageUpload || isUploading}
          disabled={
            !images || !categories || categories.length === 0
          }
          mode="contained"
          onPress={() => {
            uploadImageWithCategories();
          }}>
          บันทึก
        </Button>
      </Appbar.Header>
      {isFetching &&   <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator />
      </View>}
      <FlatList
        style={styles.container}
        ListHeaderComponent={
          <>
            <Controller
              control={control}
              name="images"
              rules={{required: 'Image is required'}}
              render={({field: {onChange, value}}) => (
                <TouchableOpacity
                  onPress={() => pickImage()}
                  style={styles.imageView}>
                  {value ?.localPathUrl ? (
                    isImagePicking ? (
                      <View style={styles.imageUploader}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <Image source={{uri: value.localPathUrl ?? ''}} style={styles.image} />
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
        data={initialCategories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <>
            <View style={styles.chipContainer}>
              <Chip
                mode={categories.includes(item) ? 'outlined' : 'flat'}
                selected={categories.includes(item)}
                onPress={() => handleSelectTag(item)}
                textStyle={
                  categories.includes(item) && styles.selectedChipText
                }>
                {item}
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
