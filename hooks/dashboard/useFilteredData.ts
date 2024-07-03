// useFilteredQuotationData.ts
import { useMemo } from 'react';
import { InvoiceStatus, Invoices, QuotationStatus, Quotations, ReceiptStatus, Receipts, SubmissionStatus, Submissions, WarrantyEmbed, WarrantyStatus } from '@prisma/client';

export const useFilteredData = (originalData: Quotations[] | Invoices[] | null, activeFilter: QuotationStatus | InvoiceStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter === QuotationStatus.ALL
      ? originalData.filter(q => q.status !== QuotationStatus.EXPIRED)
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};
export const useFilteredInvoicesData = (originalData:  Invoices[]| null, activeFilter: InvoiceStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  InvoiceStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};

export const useFilteredReceiptsData = (originalData:  Receipts[]| null, activeFilter: ReceiptStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  ReceiptStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};

export const useFilteredSubmissionsData = (originalData:  Submissions[]| null, activeFilter: SubmissionStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  SubmissionStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};


export const useFilteredWarrantyData = (originalData:  Quotations[]| null, activeFilter: WarrantyStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter ===  WarrantyStatus.ALL
      ? originalData
      : originalData.filter(q => q.warrantyStatus === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};




