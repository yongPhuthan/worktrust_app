import ImageResizer from '@bam.tech/react-native-image-resizer';
import storage from '@react-native-firebase/storage';
import { useState } from 'react';
import { useUser } from '../providers/UserContext';
import { Platform } from 'react-native';

type UploadResponse = {
  isUploading: boolean;
  error: Error | null;
  uploadImage: (imageUri: string) => Promise<{ originalUrl?: string; thumbnailUrl?: string }>;
};

export function useUploadToFirebase(storagePath: string): UploadResponse {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  const uploadImage = async (imageUri: string): Promise<{ originalUrl?: string; thumbnailUrl?: string }> => {
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

      const originalResponse = await ImageResizer.createResizedImage(
        imageUri,
        1800,
        1800,
        format,
        100,
        0,
        null,
      );

      const originalUrl = await uploadToFirebase(
        storagePath,
        user.uid,
        originalResponse.uri,
        'original',
        fileExtension,
      );

      const thumbnailResponse = await ImageResizer.createResizedImage(
        imageUri,
        300,
        200,
        format,
        80,
        0,
        null,
      );

      const thumbnailUrl = await uploadToFirebase(
        storagePath,
        user.uid,
        thumbnailResponse.uri,
        'thumbnail',
        fileExtension,
      );

      setIsUploading(false);
      return { originalUrl, thumbnailUrl };
    } catch (err) {
      console.error('Error during image processing or upload:', err);
      setError(err as Error);
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
  try {
    console.log(`Uploading ${type} image to Firebase from URI: ${uri}`);

    const fileName = `${storagePath}/${type}/${Date.now()}.${fileExtension}`;
    const reference = storage().ref(fileName);
    
    // Upload file directly from URI
    const uploadTask = reference.putFile(uri);

    // Monitor the upload progress
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case storage.TaskState.PAUSED:
              console.log('Upload is paused');
              break;
            case storage.TaskState.RUNNING:
              console.log('Upload is running');
              break;
          }
        },
        error => {
          console.error('Upload failed:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const downloadURL = await reference.getDownloadURL();
            let finalDownloadURL = downloadURL;

            // Convert .png download URL to .webp for iOS only
            if (Platform.OS === 'ios') {
              finalDownloadURL = downloadURL.replace('.png', '.webp');
            }

            resolve(finalDownloadURL);
          } catch (error) {
            if (error instanceof Error) {
              console.error('Firebase Download URL error:', error);
              reject(new Error(`Firebase Download URL error: ${error.message}`));
            } else {
              console.error(
                'Firebase Download URL error with unknown error:',
                error,
              );
              reject(new Error('Firebase Download URL error with unknown error'));
            }
          }
        },
      );
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Firebase upload error:', error);
      throw new Error(`Firebase upload error: ${error.message}`);
    } else {
      console.error('Firebase upload error with unknown error:', error);
      throw new Error('Firebase upload error with unknown error');
    }
  }
}
function convertToWebpURL(url: string): string {
  if (url.endsWith('.png')) {
    return url.replace('.png', '.webp');
  }
  return url;
}

async function uriToBase64(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as string);
        };
        reader.onerror = function () {
          reject(new Error('Failed to convert Blob to base64'));
        };
        reader.readAsDataURL(xhr.response);
      } else {
        reject(new Error(`Failed to load file: ${xhr.status}`));
      }
    };
    xhr.onerror = function () {
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}