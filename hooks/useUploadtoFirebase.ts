// hooks/useUploadImageToServer.ts
import {useState} from 'react';
import firebase from '../firebase';
import {useUser} from '../providers/UserContext';

type UploadResponse = {
  imageUrl: string | null;
  isUploading: boolean;
  error: Error | null;
  uploadImage: (imageUri: string) => Promise<void>;
};

export function useUploadToFirebase(storagePath: string): UploadResponse {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  const uploadImage = async (imageUri: string) => {
    setIsUploading(true);
    setImageUrl(null);
    setError(null);

    if (!user || !user.email) {
      console.error('User or user email is not available');
      setError(new Error('User or user email is not available'));
      setIsUploading(false);
      return;
    }

    try {
      const reference = firebase.storage().ref(storagePath);
      console.log('Uploading image to Firebase Storage', imageUri);
      await reference.putFile(imageUri); // Assuming putFile is available or adjusted for your environment

      console.log('Image uploaded successfully');
      const accessUrl = await reference.getDownloadURL();
      console.log('Download URL:', accessUrl);
      setImageUrl(accessUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(
        error instanceof Error
          ? error
          : new Error('An error occurred during the upload'),
      );
    } finally {
      setIsUploading(false);
    }
  };

  return {imageUrl, isUploading, error, uploadImage};
}
