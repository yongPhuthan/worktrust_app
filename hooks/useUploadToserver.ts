import React, { useContext, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '../providers/UserContext';
import { Store } from '../redux/store';

type User = {
  email: string;
  getIdToken: () => Promise<string>;
};

type Response = {
  isLoading: boolean;
  error: Error | null;
  createToServer: (data: any) => Promise<boolean>;
};

export function useCreateToServer(url: string, queryKey: string): Response {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();
  const {
    state: { code },
  } = useContext(Store);

  const createToServer = async (data: any): Promise<boolean> => {
    if (!user || !user.uid) {
      console.error('User or user uid is not available');
      setError(new Error('User or user uid is not available'));
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || 'An unexpected error occurred.';
        throw new Error(errorMessage);
      }

      // Invalidate queries or refetch data as needed
      queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
      return true;
    } catch (err) {
      console.error('An error occurred:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('An error occurred during worker creation')
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, createToServer };
}