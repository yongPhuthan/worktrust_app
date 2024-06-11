import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import { Company, Quotations } from '@prisma/client';
import { CompanyState } from 'types';

export interface QuotationActions {
  setPdfUrl: (url: string) => void;
  openPDFModal: () => void;

}
// Pass actions via props
const useCreateWarrantyPDF = (actions: QuotationActions) => {
  const {  setPdfUrl, openPDFModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createWarrantyPdf = async (quotation: Quotations, company:CompanyState) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/docs/createWarrantyPDF`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({quotation,company}),
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
    mutationFn: async (data: { quotation: Quotations, company: CompanyState }) => {
      const { quotation, company } = data;
      return createWarrantyPdf(quotation, company);
    },
    onSuccess: (responseData:any) => {
      setPdfUrl(responseData.pdfUrl);
      openPDFModal();
      queryClient.invalidateQueries({queryKey: ['dashboardData']});
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useCreateWarrantyPDF;
