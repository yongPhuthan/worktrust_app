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

export const get_company_state = (payload: any) => ({
  type: contrains.GET_COMPANY_STATE,
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

export const get_default_warranty = (payload: any) => ({
  type: contrains.GET_DEFAULT_WARRANTY,
  payload
});

export const get_existing_workers = (payload: any) => ({
  type: contrains.GET_EXISTING_WORKERS,
  payload
});

export const get_user_signature = (payload: any) => ({
  type: contrains.GET_USER_SIGNATURE,
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

export const getCompanyState = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_company_state(payload));
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

export const getDefaultWarranty = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_default_warranty(payload));
  };
}

export const getExistingWorkers = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_existing_workers(payload));
  };
}

export const getUserSignature = (payload: any) => {
  return (dispatch: any) => {
    dispatch(get_user_signature(payload));
  };
}

