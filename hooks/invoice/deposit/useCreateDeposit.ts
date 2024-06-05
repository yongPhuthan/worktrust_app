import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import { Invoices } from '@prisma/client';
import { CompanyState } from 'types';
import { Alert } from 'react-native';
export interface InvoiceActions {
  setPdfUrl: (url: string) => void;
  openPDFModal: () => void;
}
// Pass actions via props
const useCreateNewDepositInvoice = (actions: InvoiceActions) => {
  const {  setPdfUrl, openPDFModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createDepositInvoice = async (invoice: Invoices, company:CompanyState, quotationId:string) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }
    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/invoice/createDepositInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({invoice, company, quotationId}),
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
    mutationFn: async (data: { invoice: Invoices, company: CompanyState,quotationId:string }) => {
      const { invoice, company,quotationId } = data;
      return createDepositInvoice(invoice, company,quotationId);
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

export default useCreateNewDepositInvoice;
