import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import {  Receipts } from '@prisma/client';
import { CompanyState } from 'types';
export interface CreateNewReceiptActions {
  setPdfUrl: (url: string) => void;
  openPDFModal: () => void;
  setReceiptServerId: (id: string) => void;

}
// Pass actions via props
const useCreateNewReceipt = (actions: CreateNewReceiptActions) => {
  const {  setPdfUrl, openPDFModal, setReceiptServerId } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createReceipt = async (receipt: Receipts, company:CompanyState, quotationId:string) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/receipt/createReceipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({receipt, company, quotationId}),
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
    mutationFn: async (data: { receipt: Receipts, company: CompanyState, quotationId: string }) => {
      const { receipt, company,quotationId } = data;
      return createReceipt(receipt, company,quotationId);
    },
    onSuccess: (responseData) => {
      setPdfUrl(responseData.pdfUrl);
      setReceiptServerId(responseData.receiptId);
      openPDFModal();
      queryClient.invalidateQueries({queryKey: ['dashboardData']});
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useCreateNewReceipt;
