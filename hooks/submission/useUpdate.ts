import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
import { Submissions } from '@prisma/client';
import { CompanyState } from 'types';
export interface SubmissionActions {
  setSubmissionServerId: (id: string) => void;
  openProjectModal: () => void;
}
// Pass actions via props
const useUpdateSubmission = (actions: SubmissionActions) => {
  const { setSubmissionServerId, openProjectModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const updateSubmission = async (submission: Submissions) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/submission/updateSubmission`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({submission}),
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
    mutationFn: async (data: { submission: Submissions}) => {
        const { submission } = data;
        return updateSubmission(submission);
      },
    onSuccess: (responseData:any) => {
      setSubmissionServerId(responseData.submissionId);
      openProjectModal();
      queryClient.invalidateQueries({queryKey: ['submissionsDashboard']});
    },
    onError: (error: any) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useUpdateSubmission;
