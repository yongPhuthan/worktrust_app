import ImageResizer from '@bam.tech/react-native-image-resizer';
import {useState} from 'react';
import {useUser} from '../providers/UserContext';
import {Platform} from 'react-native';
import {nanoid} from 'nanoid';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {CLOUDFLARE_WORKER_URL, CLOUDFLARE_R2_PUBLIC_URL} from '@env';

type UploadResponse = {
  isUploading: boolean;
  error: Error | null;
  uploadImage: (
    imageUri: string,
  ) => Promise<{originalUrl?: string; thumbnailUrl?: string}>;
};

export function useUploadToCloudflare(
  code: string,
  category: string,
): UploadResponse {
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

      const originalResponse = await ImageResizer.createResizedImage(
        imageUri,
        1500,
        1500,
        format,
        100,
        0,
        null,
      );

      const originalUrl = await uploadToCloudflare(
        code,
        category,
        originalResponse.uri,
        'original',
        fileExtension,
      
        imageUri
      );

      const thumbnailResponse = await ImageResizer.createResizedImage(
        imageUri,
        500,
        500,
        format,
        80,
        0,
        null,
      );

      const thumbnailUrl = await uploadToCloudflare(
        code,
        category,
        thumbnailResponse.uri,
        'thumbnail',
        fileExtension,
      
        imageUri
      );

      setIsUploading(false);
      return {originalUrl, thumbnailUrl};
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

async function uploadToCloudflare(
  code: string,
  category: string,
  uri: string,
  imageSize: string,
  fileExtension: string,
  imageUri: string,
): Promise<string> {
  try {
    console.log(`Uploading ${imageSize} image to Cloudflare from URI: ${uri}`);

    const fileName = `${nanoid()}.${fileExtension}`;

    // Request Presigned URL from Cloudflare Worker
    const presignedUrlResponse = await fetch(
      `${CLOUDFLARE_WORKER_URL}/${imageSize}/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           code,
          [category]: 'true',
        },
        body: JSON.stringify({code}), // Adjust this as needed
      },
    );

    if (!presignedUrlResponse.ok) {
      throw new Error(
        `Error fetching presigned URL: ${presignedUrlResponse.statusText}`,
      );
    }

    const {presignedUrl} = await presignedUrlResponse.json();

    // Fetch the file blob from URI
    const fileBlob = await fetch(uri).then(res => res.blob());

    // Upload file using Presigned URL
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': `image/${fileExtension}`,
      },
      body: fileBlob,
    });

    if (!response.ok) {
      throw new Error(
        `Error uploading file to Cloudflare: ${response.statusText}`,
      );
    }
    await AsyncStorage.setItem(`${category}`, imageUri);

    return `${CLOUDFLARE_R2_PUBLIC_URL}/${code}/${category}/${imageSize}/${fileName}`;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Cloudflare upload error:', error);
      throw new Error(`Cloudflare upload error: ${error.message}`);
    } else {
      console.error('Cloudflare upload error with unknown error:', error);
      throw new Error('Cloudflare upload error with unknown error');
    }
  }
}
