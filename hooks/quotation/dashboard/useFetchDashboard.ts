import {BACK_END_SERVER_URL} from '@env';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {useContext} from 'react';
import {useUser} from '../../../providers/UserContext';
import * as stateAction from '../../../redux/actions';
import {Store} from '../../../redux/store';
import {Company, Quotations} from '@prisma/client';
import { CompanyQuery } from 'types';

interface ErrorResponse {
  message: string;
  action: 'logout' | 'redirectToCreateCompany' | 'contactSupport' | 'retry';
}


const useFetchDashboard = (): UseQueryResult<CompanyQuery, ErrorResponse> => {
  const user = useUser();
  const queryClient = useQueryClient();
  const {
    dispatch,
    state: {code},
  } = useContext(Store);

  const fetchDashboard = async (): Promise<CompanyQuery> => {
    if (!user) {
      throw new Error('User not authenticated.');
    }

    const token = await user.getIdToken();

    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/dashboard`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      queryClient.setQueryData(queryKey, {error: errorData});
      throw new Error(errorData.action);
    }

    const data = await response.json();

const company = data.company;
const quotations = company.quotations;
const services = quotations.flatMap((quotation : Quotations) => quotation.services.slice(0, 10));
    dispatch(stateAction.code_company(data.company.code));
    dispatch(stateAction.get_companyID(data.company.id));
    dispatch(stateAction.get_logo(data.company.logo));
    dispatch(stateAction.get_company_state(data.company));

    dispatch(stateAction.get_default_contract(data.company.defaultContract));
    dispatch(stateAction.get_default_warranty(data.company.defaultWarranty));
    dispatch(stateAction.get_existing_workers(data.company.workers));
    dispatch(stateAction.get_existing_services(services));
    dispatch(stateAction.get_user_signature(data.userSignature));
    dispatch(stateAction.get_seller_id(data.sellerId));

    return data;
  };

  const queryKey: QueryKey = ['dashboardData'];

  const queryOptions: UseQueryOptions<CompanyQuery, ErrorResponse> = {
    queryKey: queryKey,
    queryFn: fetchDashboard,
    retry: 3,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  };

  return useQuery<CompanyQuery, ErrorResponse>(queryOptions);
};

export default useFetchDashboard;
