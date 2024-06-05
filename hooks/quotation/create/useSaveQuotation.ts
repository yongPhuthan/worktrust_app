import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import { Company, Quotations } from '@prisma/client';
import { CompanyState } from 'types';
export interface QuotationActions {
  setQuotationServerId: (id: string) => void;
  setPdfUrl: (url: string) => void;
  openProjectModal: () => void;
}
// Pass actions via props
const useCreateQuotation = (actions: QuotationActions) => {
  const { setQuotationServerId, setPdfUrl, openProjectModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createQuotation = async (quotation: Quotations, company:CompanyState) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/docs/createQuotation`, {
      method: 'POST',
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
      return createQuotation(quotation, company);
    },
    onSuccess: (responseData:any) => {
      setQuotationServerId(responseData.quotationId);
      setPdfUrl(responseData.pdfUrl);
      openProjectModal();
      queryClient.invalidateQueries({queryKey: ['dashboardData']});
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useCreateQuotation;
