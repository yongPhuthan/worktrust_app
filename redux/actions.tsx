import {
  $Enums,
  Company,
  ContractUpdateLogEmbed,
  ContractsEmbed,
  Invoices,
  MaterialEmbed,
  Quotations,
  Receipts,
  ServiceImagesEmbed,
  ServicesEmbed,
  StandardEmbed,
  User,
  WarrantyEmbed,
  WorkerEmbed,
  Workers,
} from '@prisma/client';
import * as contrains from './constrains';

// ACTION => REDUCER

export const code_company = (payload: string) => ({
  type: contrains.CODE,
  payload,
});

export const get_companyID = (payload: string) => ({
  type: contrains.GET_COMPANYID,
  payload,
});

export const add_product = (payload: ServicesEmbed) => ({
  type: contrains.ADD_PRODUCT,
  payload,
});

export const get_company_state = (payload: Company) => ({
  type: contrains.GET_COMPANY_STATE,
  payload,
});

export const get_existing_services = (payload: ServicesEmbed[]) => ({
  type: contrains.GET_EXISTING_SERVICES,
  payload,
});

export const get_default_contract = (payload: ContractsEmbed) => ({
  type: contrains.GET_DEFAULT_CONTRACT,
  payload,
});

export const get_logo = (payload: string) => ({
  type: contrains.GET_LOGO,
  payload,
});

export const get_default_warranty = (payload: WarrantyEmbed) => ({
  type: contrains.GET_DEFAULT_WARRANTY,
  payload,
});

export const get_existing_workers = (payload: Workers[]) => ({
  type: contrains.GET_EXISTING_WORKERS,
  payload,
});

export const get_user_signature = (payload: string) => ({
  type: contrains.GET_USER_SIGNATURE,
  payload,
});

export const get_edit_quotation = (payload: Quotations) => ({
  type: contrains.GET_EDIT_QUOTATION,
  payload,
});

export const get_edit_invoice = (payload: Invoices) => ({
  type: contrains.GET_EDIT_INVOICE,
  payload,
});

export const get_edit_receipt = (payload: Receipts) => ({
  type: contrains.GET_EDIT_RECEIPT,
  payload,
});

export const reset_edit_quotation = () => ({
  type: contrains.RESET_EDIT_QUOTATION,
});

export const reset_edit_invoice = () => ({
  type:contrains.RESET_EDIT_INVOICE,
});

export const reset_edit_receipt = () => ({
  type: contrains.RESET_EDIT_RECEIPT,
});

export const get_seller_id = (payload: string) => ({
  type: contrains.GET_SELLER_ID,
  payload,
});

export const get_fcm_token = (payload: string) => ({
  type: contrains.GET_FCM_TOKEN,
  payload,
});

// COMPONENTS  => ACTION
export const codeCompany = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(code_company(payload));
  };
};
export const getCompanyID = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_companyID(payload));
  };
};
export const addProduct = (payload: ServicesEmbed) => {
  return (dispatch: (arg0: {type: string; payload: ServicesEmbed}) => void) => {
    dispatch(add_product(payload));
  };
};

export const getCompanyState = (payload: Company) => {
  return (
    dispatch: (arg0: {type: string; payload: Company | null}) => void,
  ) => {
    dispatch(get_company_state(payload));
  };
};

export const getExistingServices = (payload: ServicesEmbed[]) => {
  return (
    dispatch: (arg0: {type: string; payload: ServicesEmbed[]}) => void,
  ) => {
    dispatch(get_existing_services(payload));
  };
};

export const getDefaultContract = (payload: ContractsEmbed) => {
  return (
    dispatch: (arg0: {
      type: string;
      payload: ContractsEmbed & {contractUpdateLogs: ContractUpdateLogEmbed[]};
    }) => void,
  ) => {
    dispatch(get_default_contract(payload));
  };
};

export const getLogo = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_logo(payload));
  };
};

export const getDefaultWarranty = (payload: WarrantyEmbed) => {
  return (dispatch: (arg0: {type: string; payload: WarrantyEmbed}) => void) => {
    dispatch(get_default_warranty(payload));
  };
};

export const getExistingWorkers = (payload: Workers[]) => {
  return (dispatch: (arg0: {type: string; payload: Workers[]}) => void) => {
    dispatch(get_existing_workers(payload));
  };
};

export const getUserSignature = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_user_signature(payload));
  };
};

export const getEditQuotation = (payload: Quotations) => {
  return (dispatch: (arg0: {type: string; payload: Quotations}) => void) => {
    dispatch(get_edit_quotation(payload));
  };
};

export const resetEditQuotation = () => {
  return (dispatch: (arg0: { type: string; }) => void) => {
    dispatch(reset_edit_quotation());
  };
};

export const getEditInvoice = (payload: Invoices) => {
  return (dispatch: (arg0: {type: string; payload: Invoices}) => void) => {
    dispatch(get_edit_invoice(payload));
  };
}

export const resetEditInvoice = () => {
  return (dispatch: (arg0: { type: string; }) => void) => {
    dispatch(reset_edit_invoice());
  };
};

export const getEditReceipt = (payload: Receipts) => {
  return (dispatch: (arg0: {type: string; payload: Receipts}) => void) => {
    dispatch(get_edit_receipt(payload));
  };
}

export const resetEditReceipt = () => {
  return (dispatch: (arg0: { type: string; }) => void) => {
    dispatch(reset_edit_receipt());
  };
};



export const getSellerId = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_seller_id(payload));
  };
};

export const getFcmToken = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_fcm_token(payload));
  };
};