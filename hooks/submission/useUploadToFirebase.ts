import { useState } from 'react';
import { useUser } from '../../providers/UserContext';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import storage from '@react-native-firebase/storage';

type UploadResponse = {
  isUploading: boolean;
  error: Error | null;
  uploadImages: (images: string[], storagePath: string) => Promise<string[]>;
};

export function useUploadToFirebase(): UploadResponse {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  const uploadImages = async (
    images: string[],
    storagePath: string,
  ): Promise<string[]> => {
    if (!user || !user.uid) {
      console.error('User or user UID is not available');
      setError(new Error('User or user UID is not available'));
      return [];
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = images.map(async (imageUri) => {
        const resizedImage = await ImageResizer.createResizedImage(
          imageUri,
          800, // maxWidth for original
          800, // maxHeight for original
          'PNG', // compressFormat
          100, // quality
          0, // rotation
          null, // outputPath
        );

        return await uploadToFirebase(storagePath, resizedImage.uri, 'original');
      });

      const uploadUrls = await Promise.all(uploadPromises);
      setIsUploading(false);
      return uploadUrls;
    } catch (err) {
      console.error('Error during image processing or upload:', err);
      setIsUploading(false);
      setError(err as Error);
      return [];
    }
  };

  return {
    isUploading,
    error,
    uploadImages,
  };
}

async function uploadToFirebase(
  storagePath: string,
  uri: string,
  type: string,
): Promise<string> {
  try {
    const fileName = `${storagePath}/${type}/${Date.now()}.png`;
    const reference = storage().ref(fileName);

    const base64DataString = await uriToBase64(uri);
    const base64Data = base64DataString.split(',')[1];

    const uploadTask = reference.putString(base64Data, 'base64', {
      contentType: 'image/png',
    });

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
          try {
            const downloadURL = await reference.getDownloadURL();
            const webpDownloadURL = downloadURL.replace('.png', '.webp');
            console.log(`${type} webpDownloadURL uploaded successfully to Firebase with URL:`, webpDownloadURL);
            resolve(webpDownloadURL);
          } catch (error) {
            console.error('Firebase Download URL error:', error as Error);
            reject(new Error(`Firebase Download URL error: ${error}`));
          }
        },
      );
    });
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new Error(`Firebase upload error: ${error}`);
  }
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
        reader.onerror = function (e) {
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
