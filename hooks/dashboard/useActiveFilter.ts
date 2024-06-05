// useActiveFilter.ts
import { InvoiceStatus, QuotationStatus, ReceiptStatus } from '@prisma/client';
import { useState } from 'react';

export const useActiveFilter = () => {
  const [activeFilter, setActiveFilter] = useState<QuotationStatus>(QuotationStatus.ALL);

  const updateActiveFilter = (filter: QuotationStatus) => {
    setActiveFilter(filter);
  };

  return { activeFilter, updateActiveFilter };
};

export const useActiveInvoiceFilter = () => {
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus>(InvoiceStatus.ALL);

  const updateActiveFilter = (filter: InvoiceStatus) => {
    setActiveFilter(filter);
  };

  return { activeFilter, updateActiveFilter };
};

export const useActiveReceiptFilter = () => {
  const [activeFilter, setActiveFilter] = useState<ReceiptStatus>(ReceiptStatus.ALL);

  const updateActiveFilter = (filter: ReceiptStatus) => {
    setActiveFilter(filter);
  };

  return { activeFilter, updateActiveFilter };
};
