import {useState} from 'react';
import {useUser} from '../../providers/UserContext';
import firebase from '../../firebase';

interface UseCreateInvoiceResponse {
  loading: boolean;
  error: Error | null;
  data: any | null;
}

const useCreateInvoice = (
  url: string,
): [(data: any) => Promise<void>, UseCreateInvoiceResponse] => {
  const [response, setResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  const createInvoice = async (data: any) => {
    if (!user || !user.email) {
      setError(new Error('User or user email is not available'));
      return;
    }
    console.log('data invoice', data);
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${url}?email=${encodeURIComponent(user.email)}`,
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
        if (response.status === 401) {
          const errorData = await response.json();
          if (
            errorData.message ===
            'Token has been revoked. Please reauthenticate.'
          ) {
            // Handle specific 401 cases here if needed
            firebase.auth().signOut();
          }
          throw new Error(errorData.message);
        }
        throw new Error('Network response was not ok.');
      }
      const responseData = await response.json();
      setResponse(responseData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return [createInvoice, {loading, error, data: response}];
};

export default useCreateInvoice;
