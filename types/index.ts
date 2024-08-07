
import { IDefaultMaterials } from 'models/DefaultMaterials';
import { IDefaultStandards } from 'models/DefaultStandards';
import { IInvoices } from 'models/Invoices';
import { IQuotations } from 'models/Quotations';
import { IReceipts } from 'models/Receipts';
import { ISubmissions } from 'models/Submissions';
import { IUser } from 'models/User';
import { Types } from 'mongoose';
import { IWarrantyEmbed } from './interfaces/WarrantyEmbed';
import { IWorkerEmbed } from './interfaces/WorkerEmbed';

export type CompanyState = {
  id: Types.ObjectId;
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
  users: IUser[];
  workers: IWorkerEmbed[];
  defaultMaterials: IDefaultMaterials[];
  defaultStandards: IDefaultStandards[];
  quotations: IQuotations[];
  invoices: IInvoices[];
  bankAccounts: any[];
  receipts: IReceipts[];
  defaultWarranty: IWarrantyEmbed | null;
  submissions: ISubmissions[];
};

export type CompanyOnly = {
  id: Types.ObjectId;
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
  sellerUid: string;
};
export type ReceiptsQuery = {
  company :{
    receipts: IReceipts[];

  }

};

export type InvoiceQuery = {
  company: {
    invoices: IInvoices[];
  };
};

export type SubmissionQuery = {
  company: {
    submissions : ISubmissions[];
  };
};

export type companyWithoutQuotations = Omit<CompanyState, 'quotations'>;
