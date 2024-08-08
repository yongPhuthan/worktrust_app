import { Schema, model, Document, Types } from 'mongoose';
import { IWarrantyEmbed, warrantyEmbedSchema } from '../types/interfaces/WarrantyEmbed';

export interface ICompany extends Document {
  code: string;
  bizName: string;
  address: string;
  officeTel?: string | null;
  mobileTel?: string | null;
  companyTax?: string | null;
  bizType: string;
  logo?: string | null;
  isActive: boolean;
  userIds: Types.ObjectId[]
  workers: Types.ObjectId[] | null;
  defaultMaterials: Types.ObjectId[] | null;
  defaultStandards: Types.ObjectId[] | null;
  quotations: Types.ObjectId[]  | null;
  invoices: Types.ObjectId[] | null;
  receipts: Types.ObjectId[] | null;
  defaultWarranty?: IWarrantyEmbed | null;
  submissions: Types.ObjectId[] | null;
  notifications: Types.ObjectId[] | null;

}

export const companySchema = new Schema<ICompany>({
  code: { type: String, unique: true, required: true },
  bizName: { type: String, required: true },
  address: { type: String, required: true },
  officeTel: { type: String},
  mobileTel: { type: String },
  companyTax: { type: String },
  bizType: { type: String, required: true },
  logo: { type: String },
  isActive: { type: Boolean, default: true },
  userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  workers: [{ type: Schema.Types.ObjectId, ref: 'Worker' }],
  defaultMaterials: [{ type: Schema.Types.ObjectId, ref: 'DefaultMaterials' }],
  defaultStandards: [{ type: Schema.Types.ObjectId, ref: 'DefaultStandards' }],
  quotations: [{ type: Schema.Types.ObjectId, ref: 'Quotations' }],
  invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoices' }],
  receipts: [{ type: Schema.Types.ObjectId, ref: 'Receipts' }],
  defaultWarranty: { type: warrantyEmbedSchema },
  submissions: [{ type: Schema.Types.ObjectId, ref: 'Submissions' }],
  notifications: [{ type: Schema.Types.ObjectId, ref: 'Notifications' }],
});
companySchema.index({ code: 1 });
const Company = model<ICompany>('Company', companySchema);

export default Company;