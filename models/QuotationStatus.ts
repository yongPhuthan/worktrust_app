import {QuotationStatus} from '@prisma/client';

export const FilterLabels: {[key in QuotationStatus]: string} = {
  [QuotationStatus.ALL]: 'ทั้งหมด',
  [QuotationStatus.APPROVED]: 'อนุมัติแล้ว',
  [QuotationStatus.INVOICE_DEPOSIT]: 'มัดจำใบวางบิล',
  [QuotationStatus.RECEIPT_DEPOSIT]: 'มัดจำใบเสร็จ',
  [QuotationStatus.SUBMITTED]: 'แจ้งส่งงานแล้ว',
  [QuotationStatus.PENDING]: 'รออนุมัติ',
  // Add other labels as needed
};
