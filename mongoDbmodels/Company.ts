// import { Schema, model, Document, Types } from 'mongoose';
// import { IWarrantyEmbed, warrantyEmbedSchema } from '../types/interfaces/WarrantyEmbed';

// export interface ICompany extends Document {
//   code: string;
//   bizName: string;
//   address: string;
//   officeTel?: string | null;
//   mobileTel?: string | null;
//   companyTax?: string | null;
//   bizType: string;
//   logo?: string | null;
//   isActive: boolean;
//   userUids: string[]
//   workers: Types.ObjectId[] | null;
//   defaultMaterials: Types.ObjectId[] | null;
//   defaultStandards: Types.ObjectId[] | null;
//   quotations: Types.ObjectId[]  | null;
//   invoices: Types.ObjectId[] | null;
//   receipts: Types.ObjectId[] | null;
//   defaultWarranty?: IWarrantyEmbed | null;
//   submissions: Types.ObjectId[] | null;
//   notifications: Types.ObjectId[] | null;

// }

// export const companySchema = new Schema<ICompany>({
//   code: { type: String, unique: true, required: true },
//   bizName: { type: String, required: true },
//   address: { type: String, required: true },
//   officeTel: { type: String},
//   mobileTel: { type: String },
//   companyTax: { type: String },
//   bizType: { type: String, required: true },
//   logo: { type: String },
//   isActive: { type: Boolean, default: true },
//   userUids: [{ type: String }],
//   workers: [{ type: Schema.Types.ObjectId, ref: 'Worker' }],
//   defaultMaterials: [{ type: Schema.Types.ObjectId, ref: 'DefaultMaterials' }],
//   defaultStandards: [{ type: Schema.Types.ObjectId, ref: 'DefaultStandards' }],
//   quotations: [{ type: Schema.Types.ObjectId, ref: 'Quotations' }],
//   invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoices' }],
//   receipts: [{ type: Schema.Types.ObjectId, ref: 'Receipts' }],
//   defaultWarranty: { type: warrantyEmbedSchema },
//   submissions: [{ type: Schema.Types.ObjectId, ref: 'Submissions' }],
//   notifications: [{ type: Schema.Types.ObjectId, ref: 'Notifications' }],
// });
// companySchema.index({ code: 1 });
// const Company = model<ICompany>('Company', companySchema);

// export default Company;

// create Yup schema for validation same as ICompany
import * as Yup from 'yup';

const companySchema = Yup.object().shape({
  code: Yup.string().required("กรุณากรอกรหัสบริษัท"),
  bizName: Yup.string().required("กรุณากรอกชื่อบริษัท"),
  address: Yup.string().required("กรุณากรอกที่อยู่"),
  officeTel: Yup.string().nullable(),
  mobileTel: Yup.string().nullable(),
  companyTax: Yup.string().nullable(),
  bizType: Yup.string().required("กรุณากรอกประเภทธุรกิจ"),
  logo: Yup.string().nullable(),
  isActive: Yup.boolean().default(true),
  userUids: Yup.array().of(Yup.string()),
  workers: Yup.array().of(Yup.string()).nullable(),
  defaultMaterials: Yup.array().of(Yup.string()).nullable(),
  defaultStandards: Yup.array().of(Yup.string()).nullable(),
  quotations: Yup.array().of(Yup.string()).nullable(),
  invoices: Yup.array().of(Yup.string()).nullable(),
  receipts: Yup.array().of(Yup.string()).nullable(),
  defaultWarranty: Yup.object().shape({
    skillWarrantyMonth: Yup.number().default(0),
    productWarrantyMonth: Yup.number().required("กรุณากรอกเดือนรับประกันสินค้า"),
    fixDays: Yup.number().default(0),
    dateWarranty: Yup.date().nullable(),
    endSkillWarranty: Yup.date().nullable(),
    endProductWarranty: Yup.date().nullable(),
    condition: Yup.string().required("กรุณากรอกเงื่อนไขการรับประกันสินค้า"),
    pdfUrl: Yup.string().nullable(),
    sellerSignature: Yup.string().nullable(),
  }).nullable(),
  submissions: Yup.array().of(Yup.string()).nullable(),
  notifications: Yup.array().of(Yup.string()).nullable(),
});

type ICompany = Yup.InferType<typeof companySchema>;


export { ICompany, companySchema };