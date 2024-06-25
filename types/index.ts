import {
  ContractsEmbed,
  DefaultMaterials,
  DefaultStandards,
  Invoices,
  Quotations,
  Receipts,
  Submissions,
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
  submissions: Submissions[];
};

export type CompanyOnly = {
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
}
export type CompanyQuery = {
  company: CompanyState;
  userSignature: string;
  sellerId: string;
};
export type ReceiptsQuery = {
  company :{
    receipts: Receipts[];

  }

};

export type InvoiceQuery = {
  company: {
    invoices: Invoices[];
  };
};

export type SubmissionQuery = {
  company: {
    submissions : Submissions[];
  };
};

export type companyWithoutQuotations = Omit<CompanyState, 'quotations'>;
