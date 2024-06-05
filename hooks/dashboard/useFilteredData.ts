// useFilteredQuotationData.ts
import { useMemo } from 'react';
import { InvoiceStatus, Invoices, QuotationStatus, Quotations } from '@prisma/client';

export const useFilteredData = (originalData: Quotations[] | Invoices[]| null, activeFilter: QuotationStatus | InvoiceStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter === QuotationStatus.ALL || InvoiceStatus.ALL
      ? originalData
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
