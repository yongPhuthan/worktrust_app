import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../providers/UserContext';
import { BACK_END_SERVER_URL } from '@env';
export interface SubmissionActions {
  setSubmissionServerId: (id: string) => void;
  openProjectModal: () => void;
}
// Pass actions via props
const useCreateSubmission = (actions: SubmissionActions) => {
  const { setSubmissionServerId, openProjectModal } = actions;
  const queryClient = useQueryClient();
  const user = useUser();

  if (!user || !user.uid) {
    console.error("User authentication failed: No user available");
    throw new Error('User is not authenticated');
  }

  const createSubmission = async (data: any) => {
    if (!user || !user.uid) {
      throw new Error('User is not available');
    }

    const token = await user.getIdToken(true);
    const response = await fetch(`${BACK_END_SERVER_URL}/api/submission/createSubmission?quotationId=${encodeURI(data.quotationId)}`, {
      method: 'PUT',
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
    mutationFn: createSubmission,
    onSuccess: (responseData:any) => {
      setSubmissionServerId(responseData.submissionId);
      openProjectModal();
      queryClient.invalidateQueries({queryKey: ['submiisionData']});
    },
    onError: (error: any) => {
      console.error("Mutation error:", error.message);
    }
  });

  return { mutate, data, error, isError, isPending, isSuccess, reset };
};

export default useCreateSubmission;
