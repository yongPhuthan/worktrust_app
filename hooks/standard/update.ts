// hooks/useCreateWorker.ts
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useQueryClient, QueryClient} from '@tanstack/react-query';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import { DefaultMaterials } from '@prisma/client';


type Response = {
  isLoading: boolean;
  error: Error | null;
  putToServer: (data: any) => Promise<void>;
};

export function usePutServer(
  url: string,
  queryKey: string,
): Response {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();
  const {
    state: {code},
  } = useContext(Store);

  const putToServer = async (data: DefaultMaterials) => {
    if (!user || !user.uid) {
      console.error('User or user uid is not available');
      setError(new Error('User or user uid is not available'));
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({data}),
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
          : new Error('An error occurred during worker creation'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {isLoading, error,  putToServer};
}
