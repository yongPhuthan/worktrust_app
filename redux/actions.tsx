import * as contrains from './constrains';

// ACTION => REDUCER

export const code_company = (payload: string) => ({
  type: contrains.CODE,
  payload,
});
export const get_companyID = (payload:string) => ({
  type: contrains.GET_COMPANYID,
  payload,
});



// COMPONENTS  => ACTION
export const codeCompany = (payload: string) => {
  return (dispatch: any) => {
    dispatch(code_company(payload));
  };
};
export const getCompanyID = (payload: string) => {
  return (dispatch: any) => {
    dispatch(get_companyID(payload));
  };
};