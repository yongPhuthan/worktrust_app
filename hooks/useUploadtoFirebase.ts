import {useState} from 'react';
import firebase from '../firebase';
import {useUser} from '../providers/UserContext';

type UploadResponse = {
  isUploading: boolean;
  error: Error | null;
  uploadImage: (imageUri: string) => Promise<string | null>;
};

export function useUploadToFirebase(storagePath: string): UploadResponse {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    if (!user || !user.uid) {
      console.error('User or user UID is not available');
      setError(new Error('User or user UID is not available'));
      return null;
    }

    setIsUploading(true);
    setError(null);

    const reference = firebase.storage().ref(`${storagePath}/${user.uid}`);

    try {
      // Assuming imageUri is a local file path
      const task = reference.putFile(imageUri);

      // Monitor progress
      task.on('state_changed', snapshot => {
        console.log(`Upload is ${snapshot.bytesTransferred / snapshot.totalBytes * 100}% done`);
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      });

      await task;

      const downloadURL = await reference.getDownloadURL();
      console.log('Download URL:', downloadURL);
      setIsUploading(false);
      return downloadURL;

    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error : new Error('An error occurred during the upload'));
      setIsUploading(false);
      return null;
    }
  };

  return {
    isUploading,
    error,
    uploadImage,
  };
}
