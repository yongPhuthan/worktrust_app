import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import { Company,  Receipts } from '@prisma/client';
import { CompanyState } from 'types';
export interface ReceiptActions {
  setReceiptServerId: (id: string) => void;
  setPdfUrl: (url: string) => void;
  openPDFModal: () => void;
}
// Pass actions via props
const useUpdateReceipt = (actions: ReceiptActions) => {
  const { setReceiptServerId, setPdfUrl,openPDFModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const updateReceipt = async (receipt: Receipts, company:CompanyState) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/receipt/updateReceipt`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ receipt,company}),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("Error from server:", errorMsg);
      throw new Error(errorMsg || 'Network response was not ok.');
    }

    const responseData = await response.json();
    return responseData;  
  };

  const { mutate, data, error, isError, isPending: isUpdating, isSuccess, reset } = useMutation( {
    mutationFn: async (data: { receipt: Receipts, company: CompanyState }) => {
      const {  receipt, company } = data;
      return updateReceipt(receipt, company);
    },
    onSuccess: (responseData:any) => {
      setReceiptServerId(responseData.receiptId);
      setPdfUrl(responseData.pdfUrl);
      openPDFModal();
      queryClient.invalidateQueries({queryKey: ['dashboardReceipt']});
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isUpdating, isSuccess, reset };
};

export default useUpdateReceipt;
