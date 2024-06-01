// useActiveFilter.ts
import { QuotationStatus } from '@prisma/client';
import { useState } from 'react';

export const useActiveFilter = () => {
  const [activeFilter, setActiveFilter] = useState<QuotationStatus>(QuotationStatus.ALL);

  const updateActiveFilter = (filter: QuotationStatus) => {
    setActiveFilter(filter);
  };

  return { activeFilter, updateActiveFilter };
};
