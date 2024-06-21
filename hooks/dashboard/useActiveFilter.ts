// useActiveFilter.ts
import { InvoiceStatus, QuotationStatus, ReceiptStatus, SubmissionStatus, WarrantyStatus } from '@prisma/client';
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

export const useActiveSubmissionFilter = () => {
  const [activeFilter, setActiveFilter] = useState<SubmissionStatus>(SubmissionStatus.ALL);

  const updateActiveFilter = (filter: SubmissionStatus) => {
    setActiveFilter(filter);
  };

  return { activeFilter, updateActiveFilter };
};

export const useActiveWarrantyFilter = () => {
  const [activeFilter, setActiveFilter] = useState<WarrantyStatus>(WarrantyStatus.ALL);

  const updateActiveFilter = (filter: WarrantyStatus) => {
    setActiveFilter(filter);
  };

  return { activeFilter, updateActiveFilter };
};

