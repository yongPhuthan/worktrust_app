import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Quotation } from 'types/docType';
import { useUser } from '../../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
export interface QuotationActions {
  setQuotationServerId: (id: string) => void;
  setPdfUrl: (url: string) => void;
  setShowProjectModal: (show: boolean) => void;
}
// Pass actions via props
const useCreateQuotation = (actions: QuotationActions) => {
  const { setQuotationServerId, setPdfUrl, setShowProjectModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createQuotation = async (data: Quotation) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/documents/createQuotation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({data}),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("Error from server:", errorMsg);
      throw new Error(errorMsg || 'Network response was not ok.');
    }

    const responseData = await response.json();
    return responseData;  
  };

  const { mutate, data, error, isError, isPending, isSuccess, reset } = useMutation( {
    mutationFn: createQuotation,
    onSuccess: (responseData:any) => {
      setQuotationServerId(responseData.quotationId);
      setPdfUrl(responseData.pdfUrl);
      setShowProjectModal(true);
      queryClient.invalidateQueries({queryKey: ['dashboardQuotation']});
    },
    onError: (error: any) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useCreateQuotation;
