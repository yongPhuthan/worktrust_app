import {
  DiscountType,
  QuotationStatus,
  SellerEmbed,
  ServicesEmbed,
  TaxType,
  WarrantyStatus,
  SubmissionImagesPairEmbed,
  SubmissionBeforeImagesEmbed,
  SubmissionAfterImagesEmbed,
  type CustomerEmbed,
  type Quotations,
  type WarrantyEmbed,
} from '@prisma/client';
import {v4 as uuidv4} from 'uuid';

export const defalutCustomer: CustomerEmbed = {
  id: uuidv4(),
  name: '',
  address: '',
  customerTax: '',
  phone: '',
};

export const initialWarranty: WarrantyEmbed = {
  productWarrantyMonth: 0,
  skillWarrantyMonth: 0,
  sellerSignature: null,
  fixDays: 0,
  condition:
    'รับประกันคุณภาพตัวสินค้า ตามมาตรฐานในการใช้งานตามปกติเท่านั้น ขอสงวนสิทธ์การรับประกันที่เกิดจากการใช้งานสินค้าที่ไม่ถูกต้องหรือความเสียหายที่เกิดจากภัยธรรมชาติ หรือ การใช้งานผิดประเภทหรือปัญหาจากการกระทําของบคุคลอื่น เช่นความเสียหายที่เกิดจากการทำงานของผู้รับเหมาทีมอื่นหรือบุคคลที่สามโดยตั้งใจหรือไม่ได้ตั้งใจ',
  dateWaranty: null,
  endProductWarranty: null,
  endSkillWarranty: null,
  pdfUrl: null,
};

export const initialBeforeImage: SubmissionBeforeImagesEmbed = {
  thumbnailUrl: '',
  originalUrl: '',
};

export const initialAfterImage: SubmissionAfterImagesEmbed = {
  thumbnailUrl: '',
  originalUrl: '',
};

export const initialImagePair: SubmissionImagesPairEmbed  = {
  beforeImages: [],
  afterImages: [],
};


