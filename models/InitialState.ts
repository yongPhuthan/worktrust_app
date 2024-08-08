import { IWarrantyEmbed } from '../types/interfaces/WarrantyEmbed';
import { CustomerEmbedType } from '../validation/quotations/create';


export const defalutCustomer: CustomerEmbedType = {
  name: '',
  address: '',
  customerTax: '',
  phone: '',
};

export const initialWarranty: IWarrantyEmbed = {
  productWarrantyMonth: 0,
  skillWarrantyMonth: 0,
  sellerSignature: null,
  fixDays: 0,
  condition:
    'รับประกันคุณภาพตัวสินค้า ตามมาตรฐานในการใช้งานตามปกติเท่านั้น ขอสงวนสิทธ์การรับประกันที่เกิดจากการใช้งานสินค้าที่ไม่ถูกต้องหรือความเสียหายที่เกิดจากภัยธรรมชาติ หรือ การใช้งานผิดประเภทหรือปัญหาจากการกระทําของบคุคลอื่น เช่นความเสียหายที่เกิดจากการทำงานของผู้รับเหมาทีมอื่นหรือบุคคลที่สามโดยตั้งใจหรือไม่ได้ตั้งใจ',
  endProductWarranty: null,
  endSkillWarranty: null,
  pdfUrl: null,
};

export const initialBeforeImage = {
  thumbnailUrl: '',
  originalUrl: '',
};

export const initialAfterImage = {
  thumbnailUrl: '',
  originalUrl: '',
};

export const initialImagePair  = {
  beforeImages: [],
  afterImages: [],
};


