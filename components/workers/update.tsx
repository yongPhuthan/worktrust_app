import {BACK_END_SERVER_URL} from '@env';
import {faCamera, faClose} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {WorkerEmbed, WorkerStatus, Workers} from '@prisma/client';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useContext, useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import {Button, Checkbox, TextInput,Appbar} from 'react-native-paper';
import {useUploadMedium} from '../../hooks/useUploadMedium';
import {useCreateToServer} from '../../hooks/useUploadToserver';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import { usePutServer } from '../../hooks/workers/update';

interface ExistingModalProps {
  setRefetch: () => void;
  onClose: () => void;
  worker: Workers;
}

const UpdateWorkers = ({setRefetch, onClose, worker}: ExistingModalProps) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const queryClient = useQueryClient();
  const uriToBlobFunction = useUriToBlob();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const user = useUser();
  const {
    state: {code},
    dispatch,
  } = useContext(Store);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: {errors, isValid, isDirty},
  } = useForm<Workers>({
    mode: 'onChange',
    defaultValues: {
      id: worker.id,
      companyId: worker.companyId,
      name: worker.name,
      mainSkill: worker.mainSkill,
      image: worker.image,
      workerStatus: worker.workerStatus,
      
    },
  });
  const image = useWatch({
    control,
    name: 'image',
  });
  const pickImage = async (onChange: any) => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
    };
    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        setIsImageUpload(false);
      } else if (response.errorMessage) {
        setIsImageUpload(false);
      } else if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};

        if (source.uri) {
          try {
            onChange(source.uri); // Update the form field with the new image URI
            setValue('image', source.uri, {shouldDirty: true});
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image to Cloudflare:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  };

  const storagePath = `/users/${code}/images/workers/${getValues('name')}`;

  const {
    isUploading,
    error: uploadError,
    uploadImage,
  } = useUploadMedium(storagePath);
  const url = `${BACK_END_SERVER_URL}/api/company/updateWorker`;
  const {isLoading, error, putToServer} = usePutServer(
    url,
    'Workers',
  );

  const updateWorker = useCallback(async () => {
    if (!user || !user.uid || !isValid) {
      console.error('User or validation error');
      return;
    }

    try {
      if (isDirty) {
        if ( image && image !== worker.image) {
          const downloadUrl = await uploadImage(image);
          if (!downloadUrl) {
            throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
          }
          setValue('image', downloadUrl.originalUrl as string, {
            shouldDirty: true,
          });
        }
        const formData = getValues();
        await putToServer(formData);
        setRefetch();
        onClose();
      } else {
        console.log('No changes to save');
      }
    } catch (err) {
      console.error('An error occurred:', err);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'An error occurred while updating the worker. Please try again.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    }
  }, [
    user,
    isValid,
    image,
    worker.image,
    isDirty,
    setValue,
    getValues,
    uploadImage,
    putToServer,
    setRefetch,
    onClose,
  ]);

  const {mutate, isPending} = useMutation({
    mutationFn: updateWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workers', code],
      });
      setRefetch();
      onClose();
    },
    onError: error => {
      console.log('onError', error);
    },
  });

  return (
    <View style={styles.container}>
            <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={() => onClose()} />

        <Appbar.Content
          title={`แก้ไขทีม`}
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit set',
          }}
        />
      </Appbar.Header>
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
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
          <TextInput
            mode="outlined"
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
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
          <TextInput
            mode="outlined"
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
      <Text style={{marginTop: 30, fontSize: 16, alignItems: 'center'}}>
        สถานะ
      </Text>

      <Controller
        control={control}
        name="workerStatus"
        render={({field: {onChange, value}}) => (
          <View style={styles.checkBoxContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Checkbox.Android
                status={
                  value === WorkerStatus.MAINWORKER ? 'checked' : 'unchecked'
                }
                onPress={() => onChange(WorkerStatus.MAINWORKER)}
              />
              <Text style={{fontSize: 16}}>ช่างหลักประจำทีม</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Checkbox.Android
                status={
                  value !== WorkerStatus.MAINWORKER ? 'checked' : 'unchecked'
                }
                onPress={() => onChange(WorkerStatus.OUTSOUCRE)}
              />
              <Text style={{fontSize: 16}}>ช่างทั่วไป</Text>
            </View>
          </View>
        )}
      />
      <Button
        loading={isPending || isImageUpload || isUploading || isLoading}
        disabled={!isDirty}
        style={{
          width: '90%',
          alignSelf: 'center',
          marginBottom: 20,
          marginTop: 20,
        }}
        mode="contained"
        onPress={() => {
          mutate();
        }}>
        {'บันทึก'}
      </Button>
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

export default UpdateWorkers;
