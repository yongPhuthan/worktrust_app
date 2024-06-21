// hooks/useCreateWorker.ts
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useUser } from '../../providers/UserContext';


type CreateWorkerResponse = {
  isDeleting: boolean;
  error: Error | null;
  deleteMaterial: (id: string) => Promise<void>;
};

export function useDeleteMaterial(
  url: string,
  queryKey: string,
): CreateWorkerResponse {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();

  const deleteMaterial = async (id: string) => {
    if (!user || !user.uid) {
      console.error('User or user uid is not available');
      setError(new Error('User or user uid is not available'));
      return;
    }
    setIsDeleting(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({id}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || 'An unexpected error occurred.';
        throw new Error(errorMessage);
      }

      queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
    } catch (err) {
      console.error('An error occurred:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('An error occurred during material creation'),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return {isDeleting, error,   deleteMaterial};
}
