
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import * as contrains from './constrains';
import { IServiceEmbed } from 'types/interfaces/ServicesEmbed';
import { ICompany } from 'models/Company';
import { IWarrantyEmbed } from 'types/interfaces/WarrantyEmbed';
import { CreateQuotationSchemaType } from 'validation/quotations/create';
import { IInvoices } from 'models/Invoices';
import { IReceipts } from '../models/Receipts';
import { ISubmissions } from 'models/Submissions';
import { ISubscription } from 'models/Subscription';
import { IUser } from 'models/User';
import { NotificationType } from 'types/enums';
import { IQuotations } from 'models/Quotations';
import { Schema, model, Document, Types } from 'mongoose';
import { IWorkerEmbed } from 'types/interfaces/WorkerEmbed';

// ACTION => REDUCER

export const code_company = (payload: string) => ({
  type: contrains.CODE,
  payload,
});

export const get_companyID = (payload: Types.ObjectId) => ({
  type: contrains.GET_COMPANYID,
  payload,
});

export const add_product = (payload: IServiceEmbed) => ({
  type: contrains.ADD_PRODUCT,
  payload,
});

export const get_company_state = (payload: ICompany) => ({
  type: contrains.GET_COMPANY_STATE,
  payload,
});

export const get_existing_services = (payload: IServiceEmbed[]) => ({
  type: contrains.GET_EXISTING_SERVICES,
  payload,
});


export const get_logo = (payload: string) => ({
  type: contrains.GET_LOGO,
  payload,
});

export const get_default_warranty = (payload: IWarrantyEmbed) => ({
  type: contrains.GET_DEFAULT_WARRANTY,
  payload,
});

export const get_existing_workers = (payload: IWorkerEmbed[]) => ({
  type: contrains.GET_EXISTING_WORKERS,
  payload,
});

export const get_user_signature = (payload: string) => ({
  type: contrains.GET_USER_SIGNATURE,
  payload,
});

export const get_edit_quotation = (payload: CreateQuotationSchemaType) => ({
  type: contrains.GET_EDIT_QUOTATION,
  payload,
});

export const get_edit_invoice = (payload: IInvoices) => ({
  type: contrains.GET_EDIT_INVOICE,
  payload,
});

export const get_edit_receipt = (payload: IReceipts) => ({
  type: contrains.GET_EDIT_RECEIPT,
  payload,
});

export const get_edit_submission = (payload: ISubmissions) => ({
  type: contrains.GET_EDIT_SUBMISSION,
  payload,
});

export const view_submission = (payload: ISubmissions) => ({
  type: contrains.VIEW_SUBMISSION,
  payload,
});

export const reset_edit_quotation = () => ({
  type: contrains.RESET_EDIT_QUOTATION,
});

export const reset_edit_invoice = () => ({
  type: contrains.RESET_EDIT_INVOICE,
});

export const reset_edit_receipt = () => ({
  type: contrains.RESET_EDIT_RECEIPT,
});

export const reset_edit_submission = () => ({
  type: contrains.RESET_EDIT_SUBMISSION,
});

export const get_seller_uid = (payload: string) => ({
  type: contrains.GET_SELLER_UID,
  payload,
});

export const get_fcm_token = (payload: string) => ({
  type: contrains.GET_FCM_TOKEN,
  payload,
});

export const get_quotation_ref_number = (payload: string) => ({
  type: contrains.GET_QUOTATION_REF_NUMBER,
  payload,
});

export const get_quotation_id = (payload: string) => ({
  type: contrains.GET_QUOTATION_ID,
  payload,
});

export const get_subscription = (payload: ISubscription) => ({
  type: contrains.GET_SUBSCRIPTION,
  payload,
});

export const get_user = (payload: IUser) => ({
  type: contrains.GET_USER,
  payload,
});

export const get_firebase_user = (payload: FirebaseAuthTypes.User) => ({
  type: contrains.GET_FIREBASE_USER,
  payload,
});

export const reset_firebase_user = () => ({
  type: contrains.RESET_FIREBASE_USER,
});

export const get_notification = (payload: NotificationType[]) => ({
  type: contrains.GET_NOTIFICATION,
  payload,
});

export const get_quotations = (payload: IQuotations[]) => ({
  type: contrains.GET_QUOTATIONS,
  payload,
});

// COMPONENTS  => ACTION
export const codeCompany = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(code_company(payload));
  };
};
export const getCompanyID = (payload: Types.ObjectId) => {
  return (dispatch: (arg0: {type: string; payload: Types.ObjectId}) => void) => {
    dispatch(get_companyID(payload));
  };
};
export const addProduct = (payload: IServiceEmbed) => {
  return (dispatch: (arg0: {type: string; payload: IServiceEmbed}) => void) => {
    dispatch(add_product(payload));
  };
};

export const getCompanyState = (payload: ICompany) => {
  return (
    dispatch: (arg0: {type: string; payload: ICompany | null}) => void,
  ) => {
    dispatch(get_company_state(payload));
  };
};

export const getExistingServices = (payload: IServiceEmbed[]) => {
  return (
    dispatch: (arg0: {type: string; payload: IServiceEmbed[]}) => void,
  ) => {
    dispatch(get_existing_services(payload));
  };
};



export const getLogo = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_logo(payload));
  };
};

export const getDefaultWarranty = (payload: IWarrantyEmbed) => {
  return (dispatch: (arg0: {type: string; payload: IWarrantyEmbed}) => void) => {
    dispatch(get_default_warranty(payload));
  };
};

export const getExistingWorkers = (payload: IWorkerEmbed[]) => {
  return (dispatch: (arg0: {type: string; payload: IWorkerEmbed[]}) => void) => {
    dispatch(get_existing_workers(payload));
  };
};

export const getUserSignature = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_user_signature(payload));
  };
};

export const getEditQuotation = (payload: CreateQuotationSchemaType) => {
  return (dispatch: (arg0: {type: string; payload: CreateQuotationSchemaType}) => void) => {
    dispatch(get_edit_quotation(payload));
  };
};

export const resetEditQuotation = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_edit_quotation());
  };
};

export const getEditInvoice = (payload: IInvoices) => {
  return (dispatch: (arg0: {type: string; payload: IInvoices}) => void) => {
    dispatch(get_edit_invoice(payload));
  };
};

export const resetEditInvoice = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_edit_invoice());
  };
};

export const getEditReceipt = (payload: IReceipts) => {
  return (dispatch: (arg0: {type: string; payload: IReceipts}) => void) => {
    dispatch(get_edit_receipt(payload));
  };
};

export const resetEditReceipt = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_edit_receipt());
  };
};

export const getSellerUid = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_seller_uid(payload));
  };
};

export const getFcmToken = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_fcm_token(payload));
  };
};

export const getQuotationRefNumber = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_quotation_ref_number(payload));
  };
};

export const getQuotationId = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_quotation_id(payload));
  };
};

export const getEditSubmission = (payload: ISubmissions) => {
  return (dispatch: (arg0: {type: string; payload: ISubmissions}) => void) => {
    dispatch(get_edit_submission(payload));
  };
};

export const viewSubmission = (payload: ISubmissions) => {
  return (dispatch: (arg0: {type: string; payload: ISubmissions}) => void) => {
    dispatch(view_submission(payload));
  };
};

export const resetEditSubmission = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_edit_submission());
  };
};

export const getSubscription = (payload: ISubscription) => {
  return (dispatch: (arg0: {type: string; payload: ISubscription}) => void) => {
    dispatch(get_subscription(payload));
  };
};

export const getUser = (payload: IUser) => {
  return (dispatch: (arg0: {type: string; payload: IUser}) => void) => {
    dispatch(get_user(payload));
  };
};

export const getFirebaseUser = (payload: FirebaseAuthTypes.User) => {
  return (
    dispatch: (arg0: {type: string; payload: FirebaseAuthTypes.User}) => void,
  ) => {
    dispatch(get_firebase_user(payload));
  };
};

export const resetFirebaseUser = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_firebase_user());
  };
};

export const getNotification = (payload: NotificationType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: NotificationType[]}) => void,
  ) => {
    dispatch(get_notification(payload));
  };
};

export const getQuotations = (payload: IQuotations[]) => {
  return (
    dispatch: (arg0: {type: string; payload: IQuotations[]}) => void,
  ) => {
    dispatch(get_quotations(payload));
  };
};
