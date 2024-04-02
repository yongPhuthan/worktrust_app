import { BACK_END_SERVER_URL } from '@env';
import { faCamera, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,

  TouchableOpacity,
  View
} from 'react-native';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Checkbox, TextInput } from 'react-native-paper';
import firebase from '../../firebase';
import { useUriToBlob } from '../../hooks/utils/image/useUriToBlob';
import { useSlugify } from '../../hooks/utils/useSlugify';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
import SaveButton from '../ui/Button/SaveButton';

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
}
enum WorkerStatus {
  MAINWORKER = 'MAINWORKER',
  OUTSOURCE = 'OUTSOURCE',
}

const AddNewWorker = ({isVisible, onClose}: ExistingModalProps) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const queryClient = useQueryClient();
  const uriToBlobFunction = useUriToBlob();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const user = useUser();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: {errors, isValid, isDirty},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      mainSkill: '',
      image: '',
      workerStatus: WorkerStatus.OUTSOURCE,
    },
  });
  const image = watch('image');
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const slugify = useSlugify();
  const pickImage = async (onChange:any) => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
    };
    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        setIsImageUpload(false);
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        setIsImageUpload(false);
      } else if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};
        console.log('Image source:', source);

        if (source.uri) {
          try {
            onChange(source.uri); // Update the form field with the new image URI
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image to Cloudflare:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  };

  const createWorker = async () => {
    if (!user || !user.email || !isValid) {
      console.error('User or user email or Image is not available');
      return;
    }
  
    try {
      // Start the image upload and wait for it to finish
      const imageUrl = await uploadImageToServer(image);
console.log('imageUrl',imageUrl)
  
      // Prepare the data with the URL of the uploaded image
      const data = {
        name: getValues('name'),
        mainSkill: getValues('mainSkill'),
        workerStatus: getValues('workerStatus'),
        code,
        image: imageUrl,
      };
  
      // Proceed with creating the worker using the image URL
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/createWorker`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'An unexpected error occurred.';
        throw new Error(errorMessage);
      }
  
      // Handle successful worker creation here, if necessary
      if (response.ok) {
        queryClient.invalidateQueries(
          {
            queryKey:['workers', code]
          });

      }
  
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
  };

  const uploadImageToServer = async (imageUri: string): Promise<string> => {
    setIsImageUpload(true);
    if (!user || !user.email) {
      console.error('User or user email is not available');
      setIsImageUpload(false);
      // Explicitly throw an error or return a default/fallback string if necessary.
      throw new Error('User or user email is not available');
    }
  
    const storagePath = `${code}/workers/${getValues('name')}`;
  
    try {
      // Create a reference to the Firebase Storage location
      const reference = firebase.storage().ref(storagePath);
  
      // Upload the image file directly from the client
      console.log('Uploading image to Firebase Storage', imageUri);
      await reference.putFile(imageUri); // For React Native, use putFile with the local file URI
  
      console.log('Image uploaded successfully');
  
      // Get the download URL
      const accessUrl = await reference.getDownloadURL();
      console.log('Download URL:', accessUrl);
      return accessUrl; // Return the download URL here
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsImageUpload(false);
      // Handle the error by throwing or returning a fallback URL
      throw error; // or return a default URL if you prefer
    } finally {
      setIsImageUpload(false);
    }
  };
  const {mutate, isPending} = useMutation( {
    mutationFn: createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries(
        {
          queryKey:['workers', code]
        }
      );
      onClose();
    },
    onError: error => {
      console.log('onError', error);
      
    },
  });

  if (isPending || isImageUpload) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesomeIcon icon={faClose} size={32} color="gray" />
        </TouchableOpacity>
      
      </View>
      <Controller
        control={control}
        
        name="image"
        rules={{required: 'Image is required'}} // Add required rule here
        render={({field: {onChange, value}}) => (
          <TouchableOpacity
            onPress={() => pickImage(onChange)}
            style={styles.imageUploader}>
            {value ? (
              <Image source={{uri: value}} style={styles.image} />
            ) : (
              <FontAwesomeIcon icon={faCamera} size={40} color="gray" />
            )}
          </TouchableOpacity>
        )}
      />


      <Controller
        control={control}
        name="name"
        rules={{required: true}}
        render={({field: {onChange, onBlur, value},fieldState:{error}}) => (
          <TextInput
          mode='outlined'
          label={'ชื่อ-นามสกุลช่าง'}
          error={!!error}
            style={{marginBottom: 20}}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      {/* Description Input */}
  
      <Controller
        control={control}
        name="mainSkill"
        rules={{required: true}}
        render={({field: {onChange, onBlur, value},fieldState:{error}}) => (
          <TextInput
          mode='outlined'
          label={'เป็นช่างอะไร ?'}
          error={!!error}
            placeholder="เช่น ช่างอลูมิเนียม..."
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            // style={styles.input}
          />
        )}
      />
                  <Text style={{marginTop:30, fontSize:16,alignItems: 'center'}}>สถาณะ</Text>

      <Controller
        control={control}
        name="workerStatus"
        render={({field: {onChange, value}}) => (
          <View style={styles.checkBoxContainer}>
            <View style={{flexDirection:'row',alignItems: 'center'}}>
            <Checkbox.Android
              status={value === WorkerStatus.MAINWORKER ? 'checked' : 'unchecked'}
              onPress={() => onChange(WorkerStatus.MAINWORKER)}
            />
            <Text style={{fontSize:16}}>ช่างหลักประจำทีม</Text>
            </View>
            <View style={{flexDirection:'row',alignItems: 'center'}}>

            <Checkbox.Android
            
              status={value === WorkerStatus.OUTSOURCE ? 'checked' : 'unchecked'}
              onPress={() => onChange(WorkerStatus.OUTSOURCE)}
            />
            <Text style={{fontSize:16}}>ช่างทั่วไป</Text>
            </View>
          </View>
        )}
      />

      <SaveButton disabled={!isValid} onPress={() => mutate()} />
    </View>
  );
};
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    margin: 50,
    paddingHorizontal: 20,
marginVertical: 20,
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
});

export default AddNewWorker;
