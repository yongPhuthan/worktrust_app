// hooks/usePickImage.ts
import {useState, useCallback} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {ImageLibraryOptions, MediaType, ImagePickerResponse} from 'react-native-image-picker';

type UsePickImageReturn = {
  isImagePicking: boolean;
  pickImage: () => Promise<void>;
};

export const usePickImage = (onChange: (uri: string) => void): UsePickImageReturn => {
  const [isImageUploading, setIsImageUploading] = useState(false);

  const pickImage = useCallback(async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
    };
    
    setIsImageUploading(true);

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};
        console.log('Image source:', source);

        if (source.uri) {
          onChange(source.uri); 
        }
      }
      setIsImageUploading(false);
    });
  }, [onChange]);

  return { isImagePicking: isImageUploading, pickImage };
};
