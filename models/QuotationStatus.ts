import { InvoiceStatus, QuotationStatus, Invoices, ReceiptStatus } from '@prisma/client';

export const QuotationsFilterLabels: {[key in QuotationStatus ] : string} = {
  [QuotationStatus.ALL]: 'ทั้งหมด',
  [QuotationStatus.PENDING]: 'รออนุมัติ',
  [QuotationStatus.APPROVED]: 'อนุมัติแล้ว',
  [QuotationStatus.INVOICE_DEPOSIT]: 'มัดจำใบวางบิล',
  [QuotationStatus.RECEIPT_DEPOSIT]: 'มัดจำใบเสร็จ',
  [QuotationStatus.SUBMITTED]: 'แจ้งส่งงานแล้ว',

};

export const InvoicesFilterLabels: {[key in InvoiceStatus ] : string} = {
  [InvoiceStatus.ALL]: 'ทั้งหมด',
  [InvoiceStatus.PENDING]: 'รอวางบิล',
  [InvoiceStatus.BILLED]: 'เปิดบิลแล้ว',
  [InvoiceStatus.INVOICED]: 'วางบิลแล้ว',

};

export const ReceiptsFilterLabels: {[key in ReceiptStatus ] : string} = {
  [ReceiptStatus.ALL]: 'ทั้งหมด',
  [ReceiptStatus.PENDING]: 'รอวางบิล',
  [ReceiptStatus.BILLED]: 'เปิดบิลแล้ว',
};