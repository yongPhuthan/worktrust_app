import {
  ContractsEmbed,
  DefaultMaterials,
  DefaultStandards,
  Invoices,
  Quotations,
  Receipts,
  User,
  WarrantyEmbed,
  Workers,
} from '@prisma/client';

export type CompanyState = {
  id: string;
  code: string;
  bizName: string;
  address: string;
  officeTel: string | null;
  mobileTel: string | null;
  companyTax: string | null;
  bizType: string;
  logo: string | null;
  isActive: boolean;
  signature: string | null;
  userIds: string[];
  users: User[];
  workers: Workers[];
  defaultMaterials: DefaultMaterials[];
  defaultStandards: DefaultStandards[];
  quotations: Quotations[];
  invoices: Invoices[];
  bankAccounts: any[];
  receipts: Receipts[];
  defaultContracts: ContractsEmbed | null;
  defaultWarranty: WarrantyEmbed | null;
};
export type CompanyQuery = {
  company: CompanyState;
  userSignature: string;
  sellerId: string;
};

export type companyWithoutQuotations = Omit<CompanyState, 'quotations'>;
