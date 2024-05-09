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

export const add_product = (payload: any) => ({
  type: contrains.ADD_PRODUCT,
  payload,
});

export const get_company_seller = (payload: any) => ({
  type: contrains.GET_COMPANY_SELLER,
  payload,
});

export const get_existing_services = (payload: any) => ({
  type: contrains.GET_EXISTING_SERVICES,
  payload,
});

export const get_default_contract = (payload: any) => ({
  type: contrains.GET_DEFAULT_CONTRACT,
  payload,
});

export const get_logo = (payload: any) => ({
  type: contrains.GET_LOGO,
  payload
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
export const addProduct = (payload: any) => {
  return (dispatch: any) => {
    dispatch(add_product(payload));
  };
}

export const getCompanySeller = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_company_seller(payload));
  };
};

export const getExistingServices = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_existing_services(payload));
  };
};

export const getDefaultContract = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_default_contract(payload));
  };
}

export const getLogo = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_logo(payload));
  };
}