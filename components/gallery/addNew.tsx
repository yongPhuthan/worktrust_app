import {yupResolver} from '@hookform/resolvers/yup';
import Slider from '@react-native-community/slider';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {create, debounce, set} from 'lodash';
import React, {useContext, useEffect, useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import Marker, {Position} from 'react-native-image-marker';
import Modal from 'react-native-modal';

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
import {imageTogallery} from '../../models/validationSchema';

import {v4 as uuidv4} from 'uuid';
import firebase from '../../firebase';
import {useUploadToFirebase} from '../../hooks/useUploadtoFirebase';
import {usePickImage} from '../../hooks/utils/image/usePickImage';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
}
interface FormData {
  selectedTags: string[];
  image: string;
}
interface Tag {
  id: string;
  name: string; // ระบุว่าแต่ละ tag ต้องมีฟิลด์ name
}
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

  const imageId = uuidv4();
  const [inputValue, setInputValue] = useState<string>('');
  const [inputNewTag, setInputNewTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applyTrigger, setApplyTrigger] = useState(false);
  const [brightness, setBrightness] = useState(1);

  const [checked, setChecked] = React.useState<string | null>(null);

  const [watermarkPosition, setWatermarkPosition] =
    useState<string>('Bottom Right');

  useEffect(() => {
    // Call applyWatermark whenever the watermarkPosition changes
    if (originalImage) {
      applyWatermark();
    }
  }, [watermarkPosition]);

  const getLogoScale = async (
    backgroundImageUri: string,
    logoUri: string,
  ): Promise<number> => {
    try {
      const [bgImageSize, logoSize] = await Promise.all([
        getImageSize(backgroundImageUri),
        getImageSize(logoUri),
      ]);

      const targetLogoWidth = bgImageSize.width * 0.1; // e.g., logo is 10% of the background image width
      const logoScale = targetLogoWidth / logoSize.width; // Calculate scale factor

      return logoScale;
    } catch (error) {
      console.error('Error getting image sizes:', error);
      return 0.1; // Default scale if there's an error
    }
  };

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

  const handleDeleteTag = (tagToDelete: string): void => {
    const newTags = getValues('selectedTags').filter(
      tag => tag !== tagToDelete,
    );
    setValue('selectedTags', newTags, {shouldDirty: true});
  };
  const {
    state: {code, logoSrc},
    dispatch,
  } = useContext(Store);
  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    watch,
    setValue,
    formState: {errors, isValid, isDirty},
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      selectedTags: [],
      image: '',
    },
    resolver: yupResolver(imageTogallery),
  });
  const image = useWatch({
    control,
    name: 'image',
  });
  const selectedTags = useWatch({
    control,
    name: 'selectedTags',
  });
  const fetchTags = async () => {
    const tagsCollectionPath = `${code}/gallery/tags`;
    const tagsRef = firebase.firestore().collection(tagsCollectionPath);
    try {
      const snapshot = await tagsRef.get();
      const tagsFirestore = snapshot.docs.map(doc => doc.data().name); // Assuming 'name' is a field in the tag documents

      // Successfully fetched tags, now reset the form
      setTags(tagsFirestore);

      return tags; // You might return the tags if needed for further processing
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      // Handle the error appropriately, perhaps setting an error state or showing a message
      throw error; // Re-throwing the error if you need further error handling upstream
    }
  };
  const {
    data,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ['tags', code],
    queryFn: fetchTags,
  });
  const {isImagePicking, pickImage} = usePickImage((uri: string) => {
    setValue('image', uri, {shouldDirty: true});
    setOriginalImage(uri);
  });
  const [isWatermarkMenuVisible, setWatermarkMenuVisible] =
    useState<boolean>(true);

  const storagePath = `${code}/gallery`;

  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadToFirebase(storagePath);

  const handleAddTag = async () => {
    setIsLoading(true);
    const tagsCollectionPath = `${code}/gallery/tags`;
    const tagRef = firebase
      .firestore()
      .collection(tagsCollectionPath)
      .doc(inputNewTag);

    try {
      // Create a new tag with the current date and an empty image array
      await tagRef.set({
        name: inputNewTag,
        date: new Date(), // Store the current date and time of tag creation
        images: [], // Empty array for future image URLs
      });

      setInputNewTag(''); // Clear the input field
      setAddNewTag(false); // Optionally close the input field or provide feedback

      // Invalidate queries related to the gallery or tags to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['tags', code],
      });
      setIsLoading(false);
    } catch (error) {
      // Handle errors, such as displaying a user-friendly error message
      console.error('Failed to add tag:', error);
      alert('Failed to add tag, please try again!');
      setIsLoading(false);
    }
  };
  const uploadImageWithTags = async (): Promise<void> => {
    if (!image || selectedTags.length === 0) {
      alert('Please ensure an image is selected and at least one tag is chosen.');
      return;
    }
    setIsLoading(true);
  
    const db = firebase.firestore();
    const imageCollectionRef = db.collection(`${code}/gallery/images`);
    const tagsCollectionRef = db.collection(`${code}/gallery/tags`);
  
    try {
      // Create a new document in the Images collection
      const uploadedImageUrl = await uploadImage(image);
      if (!uploadedImageUrl) {
        console.error('Image upload returned null or undefined.');
        return;
      }
  
      const imageDocRef = await imageCollectionRef.add({
        url: uploadedImageUrl,
        tags: selectedTags, // Assuming selectedTags are IDs or names of tags
        created: new Date(), // Add the created field here
      });
  
      // For each tag, update or create a tag document to include the image URL
      selectedTags.forEach(async tag => {
        const tagRef = tagsCollectionRef.doc(tag);
        const doc = await tagRef.get();
  
        if (doc.exists) {
          // Update existing tag document to include this image
          await tagRef.update({
            images: firebase.firestore.FieldValue.arrayUnion(imageDocRef.id),
          });
        } else {
          // Optionally handle the case where the tag does not exist
          await tagRef.set({
            name: tag,
            images: [imageDocRef.id],
            created: new Date(),
          });
        }
      });
  
      onClose();
      reset();
  
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['gallery', code],
        });
      }, 1500); // หน่วงเวลา 1.5 วินาที (1500 มิลลิวินาที)
    } catch (error) {
      console.error('Error uploading image with tags:', error);
      alert('Error uploading image with tags, please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setValue(
        'selectedTags',
        selectedTags.filter(t => t !== tag),
      ); // Unselect the tag
    } else {
      setValue('selectedTags', [...selectedTags, tag]); // Select the tag
    }
  };

  if (isFetching) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator />
      </View>
    );
  }
  const clearWatermark = () => {
    setChecked(null);
    setValue('image', originalImage ?? '', {shouldDirty: true}); // Reset to original image
  };

  const handleSwitchChange = (value: boolean) => {
    setAddWatermark(value);
    if (!value) {
      clearWatermark();
    }
  };

  const applyWatermark = async () => {
    if (!originalImage) return;
    // const logoScale = await getLogoScale(originalImage, logoSrc);
    const options = {
      // background image
      backgroundImage: {
        src: originalImage,
        scale: 1,
      },

      watermarkImages: [
        {
          src: logoSrc,
          scale: logoScale,
          position: {
            position: getPositionBasedOn(watermarkPosition),
          },
          alpha: brightness,
        },
      ],
      scale: 1,
      quality: 100,
      filename: imageId,
    };

    try {
      const markedImage = await Marker.markImage(options);
      setValue('image', markedImage, {shouldDirty: true});
    } catch (error) {
      console.error('Error applying watermark:', error);
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
          disabled={!image || !selectedTags || selectedTags.length === 0}
          mode="contained"
          onPress={() => {
            uploadImageWithTags();
          }}>
          บันทึก
        </Button>
      </Appbar.Header>
      <FlatList
        style={styles.container}
        data={[{key: 'main'}]}
        renderItem={() => (
          <View
            style={{
              marginBottom: 80,
            }}>
            <Controller
              control={control}
              name="image"
              rules={{required: 'Image is required'}}
              render={({field: {onChange, value}}) => (
                <TouchableOpacity
                  onPress={() => pickImage()}
                  style={styles.imageView}>
                  {value ? (
                    isImagePicking ? (
                      <ActivityIndicator />
                    ) : (
                      <Image source={{uri: value}} style={styles.image} />
                    )
                  ) : isImagePicking ? (
                    <ActivityIndicator />
                  ) : (
                    <View style={styles.imageUploader}>
                      <IconButton
                        icon={'camera-plus'}
                        size={40}
                        iconColor="#0073BA"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
            <Divider style={{marginVertical: 10}} />

            <View>
              {tags.length > 0 && (
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
                      width: '100%',
                    }}>
                    เพิ่มหมวดหมู่
                  </Button>
                </View>
              )}

              <FlatList
                data={tags}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={styles.chipContainer}>
                    <Chip
                      mode={selectedTags.includes(item) ? 'outlined' : 'flat'}
                      selected={selectedTags.includes(item)}
                      onPress={() => handleSelectTag(item)}
                      textStyle={
                        selectedTags.includes(item) && styles.selectedChipText
                      }>
                      {item}
                    </Chip>
                  </View>
                )}
                numColumns={2}
                ListEmptyComponent={
                  <Button
                    mode="outlined"
                    icon={'plus'}
                    onPress={() => setAddNewTag(!addNewTag)}
                    style={{
                      width: '50%',
                    }}>
                    เพิ่มหมวดหมู่
                  </Button>
                }
              />
              <Divider style={{marginVertical: 10}} />
            </View>

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
                    minimumValue={0.1}
                    maximumValue={0.3}
                    value={logoScale}
                    onValueChange={value => setLogoScale(value)}
                    onSlidingComplete={debounce(applyWatermark, 1000)}
                    minimumTrackTintColor="#4caf82"
                    maximumTrackTintColor="#a5d6c1"
                    thumbTintColor="#4caf82"
                  />
                </View>
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
              </>
            )}

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
                      onPress={() => handleAddTag()}>
                      บันทึก
                    </Button>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        )}
        keyExtractor={() => 'main'}
      />
    </>
  );
};
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    width: windowWidth,
    height: 'auto',
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
    borderColor: '#0073BA',
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
    marginTop: 10,
  },
  row: {
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
