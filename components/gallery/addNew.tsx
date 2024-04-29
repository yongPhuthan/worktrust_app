import {BACK_END_SERVER_URL} from '@env';
import {faCamera, faClose} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useContext, useState} from 'react';
import {Controller, set, useForm, useWatch} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useQuery} from '@tanstack/react-query';

import {
  createStandardSchema,
  imageTogallery,
} from '../../screens/utils/validationSchema';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  View,
} from 'react-native';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  TextInput,
  Button,
  Appbar,
  Chip,
  Checkbox,
  List,
} from 'react-native-paper';
import firebase from '../../firebase';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import {useSlugify} from '../../hooks/utils/useSlugify';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import SaveButton from '../ui/Button/SaveButton';
import {useUploadToFirebase} from '../../hooks/useUploadtoFirebase';
import {useCreateToServer} from '../../hooks/useUploadToserver';
import {v4 as uuidv4} from 'uuid';
import {usePickImage} from '../../hooks/utils/image/usePickImage';

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

const AddNewImage = ({isVisible, onClose}: ExistingModalProps) => {
  const queryClient = useQueryClient();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [addNewTag, setAddNewTag] = useState(false);
  const user = useUser();
  const imageId = uuidv4();
  const [inputValue, setInputValue] = useState<string>('');
  const [inputNewTag, setInputNewTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleDeleteTag = (tagToDelete: string): void => {
    const newTags = getValues('selectedTags').filter(
      tag => tag !== tagToDelete,
    );
    setValue('selectedTags', newTags, {shouldDirty: true});
  };
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
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
    const tagsCollectionPath = `${code}/gallery/Tags`;
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
  });

  const storagePath = `${code}/gallery/images/${imageId}`;

  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadToFirebase(storagePath);

  const addImage = useCallback(async () => {
    if (!user || !user.uid || !isValid) {
      console.error('User or user email or Image is not available');
      return;
    }
    const uploadPromises = [uploadImage(image)];
    const downloadUrl = await Promise.all(uploadPromises);
    if (uploadError) {
      throw new Error('There was an error uploading the images');
    }
    if (!downloadUrl) {
      throw new Error('ไม่สามาถอัพโหลดรูปภาพได้');
    }
    try {
      setValue('image', downloadUrl[0] as string);
      const formData = {
        ...getValues(),
      };

      // await createToServer(formData);
    } catch (err) {
      // Handle errors from image upload or worker creation
      console.error('An error occurred:', err);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'An error occurred while creating the worker. Please try again.',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    }
  }, [
    user,
    isValid,
    image,
    code,
    uploadImage,
    // createToServer,
    queryClient,
    BACK_END_SERVER_URL,
    getValues,
  ]);

  const {mutate, isPending} = useMutation({
    mutationFn: addImage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workers', code],
      });
      onClose();
    },
    onError: error => {
      console.log('onError', error);
    },
  });

  const handleAddTag = async () => {
    setIsLoading(true);
    const tagsCollectionPath = `${code}/gallery/Tags`;
    const tagRef = firebase.firestore().collection(tagsCollectionPath).doc(inputNewTag);

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
      alert(
        'Please ensure an image is selected and at least one tag is chosen.',
      );
      return;
    }
    setIsLoading(true);

    const db = firebase.firestore();
    const imageCollectionRef = db.collection(`${code}/gallery/Images`);
    const tagsCollectionRef = db.collection(`${code}/gallery/Tags`);

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
      });

      // For each tag, update or create a tag document to include the image URL
      selectedTags.forEach(async tag => {
        const tagRef = tagsCollectionRef.doc(tag);
        const doc = await tagRef.get()

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
          });
        }
      });

      queryClient.invalidateQueries({
        queryKey: ['gallery', code],
      });
      onClose();
      reset();
      setIsLoading(false);
    } catch (error) {
      console.error('Error uploading image with tags:', error);
      alert('Error uploading image with tags, please try again.');
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
            fontSize: 16,
            fontFamily: 'Sukhumvit Set Bold',
            lineHeight: 24,
          }}
        />
        <Button
          loading={isPending || isImageUpload || isUploading || isLoading}
          disabled={!image || !selectedTags || selectedTags.length === 0}
          children="บันทึก"
          mode="contained"
          onPress={() => {
            uploadImageWithTags();
            // mutate();
          }}></Button>
      </Appbar.Header>
      <View style={styles.container}>
        <Controller
          control={control}
          name="image"
          rules={{required: 'Image is required'}}
          render={({field: {onChange, value}}) => (
            <TouchableOpacity
              onPress={() => pickImage()}
              style={styles.imageUploader}>
              {value ? (
                <Image source={{uri: value}} style={styles.image} />
              ) : (
                <FontAwesomeIcon icon={faCamera} size={40} color="gray" />
              )}
            </TouchableOpacity>
          )}
        />
        {addNewTag ? (
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              padding: 10,
              gap: 10,
            }}>
            <TextInput
              placeholder="เช่น สีดำด้าน, กระจกเทมเปอร์..."
              label={'เพิ่มหมวดหมู่ของรูปภาพนี้'}
              mode="outlined"
              style={{width: '80%'}}
              textAlignVertical="top"
              value={inputNewTag}
              onChangeText={setInputNewTag}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                gap: 10,
              }}>
              <Button
                mode="text"
                onPress={() => setAddNewTag(false)}
                children="ยกเลิก"
              />
              <Button
                mode="contained"
                disabled={isLoading || !inputNewTag}
                loading={isLoading}
                onPress={() => handleAddTag()}
                children="บันทึก"
              />
            </View>
          </View>
        ) : (
          <View>
            {tags.length > 0 && (
              <Button
                mode="text"
                icon={'plus'}
                onPress={() => setAddNewTag(!addNewTag)}
                style={{
                  width: '50%',
                  marginTop: 10,
                  alignSelf: 'flex-end',
                }}
                children="เพิ่มหมวดหมู่"
              />
            )}
            <FlatList
              data={tags}
              style={{
                marginBottom: 40,
              }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 5,
                  }}>
                  <Checkbox.Android
                    status={
                      selectedTags.includes(item) ? 'checked' : 'unchecked'
                    }
                    onPress={() => handleSelectTag(item)}
                  />
                  <Text>{item}</Text>
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
                  }}
                  children="เพิ่มหมวดหมู่"
                />
              }
            />
          </View>
        )}
      </View>
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
    height: windowHeight,
  },
  imageUploader: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chip: {
    marginRight: 5,
    marginBottom: 5,
  },
});

export default AddNewImage;