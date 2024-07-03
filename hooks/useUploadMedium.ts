import {useState} from 'react';
import firebase from '../firebase';
import {useUser} from '../providers/UserContext';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {Platform} from 'react-native';

type UploadResponse = {
  isUploading: boolean;
  error: Error | null;
  uploadImage: (
    imageUri: string,
  ) => Promise<{originalUrl?: string; thumbnailUrl?: string}>;
};

export function useUploadMedium(storagePath: string): UploadResponse {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  const uploadImage = async (
    imageUri: string,
  ): Promise<{originalUrl?: string; thumbnailUrl?: string}> => {
    if (!user || !user.uid) {
      console.error('User or user UID is not available');
      setError(new Error('User or user UID is not available'));
      return {};
    }

    setIsUploading(true);
    setError(null);

    try {
      const format = Platform.OS === 'android' ? 'WEBP' : 'PNG'; // ใช้ WEBP สำหรับ Android และ PNG สำหรับอื่นๆ
      const fileExtension = Platform.OS === 'android' ? 'webp' : 'png';
      // Resize and upload original image as WebP
      const originalResponse = await ImageResizer.createResizedImage(
        imageUri,
        900, // maxWidth for medium
        900, // maxHeight for original
        format, // compressFormat
        100, // quality
        0, // rotation
        null, // outputPath
      );

      const originalUrl = await uploadToFirebase(
        storagePath,
        user.uid,
        originalResponse.uri,
        'original',
        fileExtension,
      );

      // Resize and upload thumbnail as WebP

      setIsUploading(false);
      return {originalUrl};
    } catch (err) {
      console.error('Error during image processing or upload:', err);

      setIsUploading(false);
      return {};
    }
  };

  return {
    isUploading,
    error,
    uploadImage,
  };
}

async function uploadToFirebase(
  storagePath: string,
  userId: string,
  uri: string,
  type: string,
  fileExtension: string,
): Promise<string> {
  const fullPath = `${storagePath}/${type}/${Date.now()}.${fileExtension}`;
  const reference = firebase.storage().ref(fullPath);
  await reference.putFile(uri);
  const downloadURL = await reference.getDownloadURL();
  let finalDownloadURL = downloadURL;

  // Convert .png download URL to .webp for iOS only
  if (Platform.OS === 'ios') {
    finalDownloadURL = downloadURL.replace('.png', '.webp');
  }
  return finalDownloadURL;
}
