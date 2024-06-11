import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import { Invoices, Receipts } from '@prisma/client';
import { CompanyState } from 'types';
import { Alert } from 'react-native';
export interface ReceiptActions {
  setPdfUrl: (url: string) => void;
  openPDFModal: () => void;
}
// Pass actions via props
const useCreateNewDepositReceipt = (actions: ReceiptActions) => {
  const {  setPdfUrl, openPDFModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createDepositReceipt = async (receipt: Receipts, company:CompanyState, quotationId:string) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }
    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/receipt/createDepositReceipt`, {
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
    mutationFn: async (data: { receipt: Receipts, company: CompanyState,quotationId:string }) => {
      const { receipt, company,quotationId } = data;
      return createDepositReceipt(receipt, company,quotationId);
    },
    onSuccess: (responseData) => {
      setPdfUrl(responseData.pdfUrl);
      openPDFModal();
      queryClient.invalidateQueries({queryKey: ['dashboardData']});
    },
    onError: (error) => {
      console.error("Mutation error:", error.message);
      Alert.alert('เกิดข้อผิดพลาด', error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useCreateNewDepositReceipt;
