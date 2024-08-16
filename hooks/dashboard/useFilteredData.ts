// useFilteredQuotationData.ts
import { useMemo } from 'react';
import { QuotationStatus, InvoiceStatus,ReceiptStatus, SubmissionStatus, WarrantyStatus  } from '../../types/enums';
import { IQuotations } from '../../models/Quotations';
import { IInvoices } from '../../models/Invoices';
import { IReceipts } from '../../models/Receipts';
import { ISubmissions } from '../../models/Submissions';
export const useFilteredData = (originalData: IQuotations[]  | null, activeFilter: QuotationStatus | InvoiceStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter === QuotationStatus.ALL
      ? originalData.filter(q => q.status !== QuotationStatus.EXPIRED)
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};
export const useFilteredInvoicesData = (originalData:  IInvoices[]| null, activeFilter: InvoiceStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  InvoiceStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};

export const useFilteredReceiptsData = (originalData:  IReceipts[]| null, activeFilter: ReceiptStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  ReceiptStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};

export const useFilteredSubmissionsData = (originalData:  ISubmissions[]| null, activeFilter: SubmissionStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  SubmissionStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};


export const useFilteredWarrantyData = (originalData:  IQuotations[]| null, activeFilter: WarrantyStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  WarrantyStatus.ALL
      ? originalData
      : originalData.filter(q => q.warrantyStatus === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};




