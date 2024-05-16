import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Quotation } from 'types/docType';
import { useUser } from '../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
export interface InvoiceActions {
  setPdfUrl: (url: string) => void;
  openPDFModal: () => void;
}
// Pass actions via props
const useCreateNewDepositReceipt = (actions: InvoiceActions) => {
  const {  setPdfUrl, openPDFModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createDepositReceiipt = async (data:any) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/invoice/createDepositReceipt`, {
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
    mutationFn: createDepositReceiipt,
    onSuccess: (responseData:any) => {
      setPdfUrl(responseData.pdfUrl);
      openPDFModal();
      queryClient.invalidateQueries({queryKey: ['dashboardInvoice']});
    },
    onError: (error: any) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useCreateNewDepositReceipt;
