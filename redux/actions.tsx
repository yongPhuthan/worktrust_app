
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { NotificationType } from '../types/enums';

import * as contrains from './constrains';

import { UserType } from '../validation/collection/users';
import { QuotationSchemaType } from '../validation/collection/subcollection/quotations';
import { CompanyType } from '../validation/collection/companies';
import { StandardSchemaType } from '../validation/collection/subcollection/standard';
import { MaterialSchemaType } from '../validation/collection/subcollection/materials';
import {WarrantySchemaType} from '../validation/collection/subcollection/warranty';
import { ServiceSchemaType } from '../validation/field/services';
import { WorkerSchemaType } from '../validation/collection/subcollection/workers';
import { ProjectImagesSchemaType } from '../validation/collection/subcollection/projectImages';
import { CategorySchemaType } from '../validation/collection/subcollection/categories';
import { QuotationEventsType } from 'validation/collection/subcollection/events';


// ACTION => REDUCER

export const code_company = (payload: string) => ({
  type: contrains.CODE,
  payload,
});

export const get_gallery = (payload: ProjectImagesSchemaType[]) => ({
  type: contrains.GET_GALLERY,
  payload,
});

export const get_companyID = (payload: string) => ({
  type: contrains.GET_COMPANYID,
  payload,
});

export const add_product = (payload: ServiceSchemaType) => ({
  type: contrains.ADD_PRODUCT,
  payload,
});

export const get_company_state = (payload: CompanyType) => ({
  type: contrains.GET_COMPANY_STATE,
  payload,
});

export const get_existing_services = (payload: ServiceSchemaType[]) => ({
  type: contrains.GET_EXISTING_SERVICES,
  payload,
});


export const get_logo = (payload: string) => ({
  type: contrains.GET_LOGO,
  payload,
});

export const get_default_warranty = (payload: WarrantySchemaType) => ({
  type: contrains.GET_DEFAULT_WARRANTY,
  payload,
});

export const get_existing_workers = (payload: WorkerSchemaType[]) => ({
  type: contrains.GET_EXISTING_WORKERS,
  payload,
});

export const get_user_signature = (payload: string) => ({
  type: contrains.GET_USER_SIGNATURE,
  payload,
});

export const get_edit_quotation = (payload: QuotationSchemaType) => ({
  type: contrains.GET_EDIT_QUOTATION,
  payload,
});

export const get_edit_invoice = (payload: any) => ({
  type: contrains.GET_EDIT_INVOICE,
  payload,
});

export const get_edit_receipt = (payload: any) => ({
  type: contrains.GET_EDIT_RECEIPT,
  payload,
});

export const get_edit_submission = (payload: any) => ({
  type: contrains.GET_EDIT_SUBMISSION,
  payload,
});

export const view_submission = (payload: any) => ({
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

export const get_subscription = (payload: any) => ({
  type: contrains.GET_SUBSCRIPTION,
  payload,
});

export const get_user = (payload: UserType) => ({
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

export const get_quotations = (payload: QuotationSchemaType[]) => ({
  type: contrains.GET_QUOTATIONS,
  payload,
});

export const get_categories = (payload: CategorySchemaType[]) => ({
  type: contrains.GET_CATEGORIES,
  payload,
});

export const get_initial_gallery = (payload: ProjectImagesSchemaType[]) => ({
  type: contrains.GET_INITIAL_GALLERY,
  payload,
});

export const get_standard = (payload: StandardSchemaType[]) => ({
  type: contrains.GET_STANDARD,
  payload,
});
export const get_material = (payload: MaterialSchemaType[]) => ({
  type: contrains.GET_MATERIAL,
  payload,
});

export const get_quotations_events = (payload: QuotationEventsType[]) => ({
  type: contrains.GET_QUOTATIONS_EVENTS,
  payload,
});

export const update_quotations_events = (payload: QuotationEventsType) => ({
  type: contrains.UPDATE_QUOTATIONS_EVENTS,
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
export const addProduct = (payload: ServiceSchemaType) => {
  return (dispatch: (arg0: {type: string; payload: ServiceSchemaType}) => void) => {
    dispatch(add_product(payload));
  };
};

export const getCompanyState = (payload: CompanyType) => {
  return (
    dispatch: (arg0: {type: string; payload: CompanyType | null}) => void,
  ) => {
    dispatch(get_company_state(payload));
  };
};

export const getExistingServices = (payload: ServiceSchemaType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: ServiceSchemaType[]}) => void,
  ) => {
    dispatch(get_existing_services(payload));
  };
};



export const getLogo = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_logo(payload));
  };
};

export const getDefaultWarranty = (payload: WarrantySchemaType) => {
  return (dispatch: (arg0: {type: string; payload: WarrantySchemaType}) => void) => {
    dispatch(get_default_warranty(payload));
  };
};

export const getExistingWorkers = (payload: WorkerSchemaType[]) => {
  return (dispatch: (arg0: {type: string; payload: WorkerSchemaType[]}) => void) => {
    dispatch(get_existing_workers(payload));
  };
};

export const getUserSignature = (payload: string) => {
  return (dispatch: (arg0: {type: string; payload: string}) => void) => {
    dispatch(get_user_signature(payload));
  };
};

export const getEditQuotation = (payload: QuotationSchemaType) => {
  return (dispatch: (arg0: {type: string; payload: QuotationSchemaType}) => void) => {
    dispatch(get_edit_quotation(payload));
  };
};

export const resetEditQuotation = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_edit_quotation());
  };
};

export const getEditInvoice = (payload: any) => {
  return (dispatch: (arg0: {type: string; payload: any}) => void) => {
    dispatch(get_edit_invoice(payload));
  };
};

export const resetEditInvoice = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_edit_invoice());
  };
};

export const getEditReceipt = (payload: any) => {
  return (dispatch: (arg0: {type: string; payload: any}) => void) => {
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

export const getEditSubmission = (payload: any) => {
  return (dispatch: (arg0: {type: string; payload: any}) => void) => {
    dispatch(get_edit_submission(payload));
  };
};

export const viewSubmission = (payload: any) => {
  return (dispatch: (arg0: {type: string; payload: any}) => void) => {
    dispatch(view_submission(payload));
  };
};

export const getGallery = (payload: ProjectImagesSchemaType[]) => {
  return (dispatch: (arg0: {type: string; payload: ProjectImagesSchemaType[]}) => void) => {
    dispatch(get_gallery(payload));
  };
}

export const resetEditSubmission = () => {
  return (dispatch: (arg0: {type: string}) => void) => {
    dispatch(reset_edit_submission());
  };
};

export const getSubscription = (payload: any) => {
  return (dispatch: (arg0: {type: string; payload: any}) => void) => {
    dispatch(get_subscription(payload));
  };
};

export const getUser = (payload: UserType) => {
  return (dispatch: (arg0: {type: string; payload: UserType}) => void) => {
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

export const getQuotations = (payload: QuotationSchemaType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: QuotationSchemaType[]}) => void,
  ) => {
    dispatch(get_quotations(payload));
  };
};

export const getCategories = (payload: CategorySchemaType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: CategorySchemaType[]}) => void,
  ) => {
    dispatch(get_categories(payload));
  };
}

export const getInitialGallery = (payload: ProjectImagesSchemaType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: ProjectImagesSchemaType[]}) => void,
  ) => {
    dispatch(get_initial_gallery(payload));
  };
}

export const getStandard = (payload: StandardSchemaType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: StandardSchemaType[]}) => void,
  ) => {
    dispatch(get_standard(payload));
  };
}

export const getMaterial = (payload: MaterialSchemaType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: MaterialSchemaType[]}) => void,
  ) => {
    dispatch(get_material(payload));
  };
}

export const getQuotationsEvents = (payload: QuotationEventsType[]) => {
  return (
    dispatch: (arg0: {type: string; payload: QuotationEventsType[]}) => void,
  ) => {
    dispatch(get_quotations_events(payload));
  };
}

export const updateQuotationsEvents = (payload: QuotationEventsType) => {
  return (
    dispatch: (arg0: {type: string; payload: QuotationEventsType}) => void,
  ) => {
    dispatch(update_quotations_events(payload));
  };
};