import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import { Company, Quotations } from '@prisma/client';

// Pass actions via props
const useResetQuotation = () => {
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const resetStatus = async (quotationId:string) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
        await fetch(`${BACK_END_SERVER_URL}/api/docs/resetQuotationStatus?id=${encodeURI(quotationId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { mutate, data, error, isError, isPending, isSuccess, reset } = useMutation( {
    mutationFn: async (quotationId:string ) => {

      return resetStatus(quotationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['dashboardData']});
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useResetQuotation;
