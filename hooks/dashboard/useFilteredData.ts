// useFilteredQuotationData.ts
import { useMemo } from 'react';
import { QuotationStatus, Quotations } from '@prisma/client';

export const useFilteredData = (originalData: Quotations[] | null, activeFilter: QuotationStatus) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter === QuotationStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};
