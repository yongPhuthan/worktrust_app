import {
  InvoiceStatus,
  QuotationStatus,
  ReceiptStatus,
  SubmissionStatus,
  WarrantyStatus,
} from '@prisma/client';

export const QuotationsFilterLabels: {[key in QuotationStatus]: string} = {
  [QuotationStatus.ALL]: 'ทั้งหมด',
  [QuotationStatus.PENDING]: 'รออนุมัติ',
  [QuotationStatus.APPROVED]: 'อนุมัติแล้ว',
  [QuotationStatus.INVOICE_DEPOSIT]: 'มัดจำใบวางบิล',
  [QuotationStatus.RECEIPT_DEPOSIT]: 'มัดจำใบเสร็จ',
  [QuotationStatus.SUBMITTED]: 'แจ้งส่งงานแล้ว',
  [QuotationStatus.CUSTOMER_APPROVED]: 'ลูกค้าอนุมัติแล้ว',
  [QuotationStatus.CUSTOMER_REJECTED]: 'รอแก้ไข',
  [QuotationStatus.CUSTOMER_REVIEWED]: 'ส่งงานผ่าน-ได้รับรีวิว',
};

export const InvoicesFilterLabels: {[key in InvoiceStatus]: string} = {
  [InvoiceStatus.ALL]: 'ทั้งหมด',
  [InvoiceStatus.PENDING]: 'รอวางบิล',
  [InvoiceStatus.BILLED]: 'เปิดบิลแล้ว',
  [InvoiceStatus.INVOICED]: 'วางบิลแล้ว',
};

export const ReceiptsFilterLabels: {[key in ReceiptStatus]: string} = {
  [ReceiptStatus.ALL]: 'ทั้งหมด',
  [ReceiptStatus.PENDING]: 'รอวางบิล',
  [ReceiptStatus.BILLED]: 'เปิดบิลแล้ว',
};

export const SubmissionFilterLabels: {[key in SubmissionStatus]: string} = {
  [SubmissionStatus.ALL]: 'ทั้งหมด',
  [SubmissionStatus.PENDING]: 'รอตรวจงาน',
  [SubmissionStatus.APPROVED]: 'อนุมัติแล้ว',
  [SubmissionStatus.REJECTED]: 'รอแก้ไข',
};

export const WarrantyFilterLabels: {[key in WarrantyStatus]: string} = {
  [WarrantyStatus.ALL]: 'ทั้งหมด',
  [WarrantyStatus.PENDING]: 'ยังไม่ออกใบรับประกัน',
  [WarrantyStatus.ACTIVE]: 'อยู่ในระยะประกัน',
  [WarrantyStatus.EXPIRED]: 'สิ้นสุดการรับประกัน',
};

