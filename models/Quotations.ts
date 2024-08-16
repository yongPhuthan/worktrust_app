import { Document, model, Schema, Types } from 'mongoose';
import { QuotationStatus, TaxType, WarrantyStatus } from '../types/enums';
import { customerEmbedSchema, ICustomerEmbed } from '../types/interfaces/CustomerEmbed';
import { IServiceEmbed, serviceEmbedSchema } from '../types/interfaces/ServicesEmbed';
import { ISellerEmbed, sellerEmbedSchema } from 'types/interfaces/SellerEmbed';
import { IWorkerEmbed, workerEmbedSchema } from 'types/interfaces/WorkerEmbed';
import { IWarrantyEmbed, warrantyEmbedSchema } from 'types/interfaces/WarrantyEmbed';

export interface IQuotations extends Document {
  _id : Types.ObjectId;
  services: IServiceEmbed[];
  customer: ICustomerEmbed;
  isArchived : boolean;
  vat7: number;
  taxType: TaxType;
  taxValue: number;
  summary: number;
  summaryAfterDiscount: number;
  warrantyStatus : WarrantyStatus;
  workers : IWorkerEmbed[] | null;
  docUrl: string;
  discountType: string | null;
  discountPercentage: number | null;
  discountValue: number | null;
  sellerEmbed : ISellerEmbed;
  allTotal: number;
  sellerUid : string;
  dateOffer: Date;
  dateEnd: Date;
  docNumber: string;
  FCMToken: string 
  warranty : IWarrantyEmbed 
  sellerSignature: string | null;
  noteToCustomer?: string | null;
  noteToTeam?: string | null;
  status: QuotationStatus;
  pdfUrl?: string | null;
  companyId: Types.ObjectId;
  created: Date | null;
  updated: Date | null;
}

export const quotationsSchema = new Schema<IQuotations>({
    services: {
        type: [serviceEmbedSchema],
        required: true,
      },
  customer: { type: customerEmbedSchema, required: true },
  vat7: { type: Number, required: true },
  taxType: { type: String ,  enum: Object.values(TaxType), default: TaxType.NOTAX },
  taxValue: { type: Number, default: 0 },
  summary: { type: Number, required: true },
  summaryAfterDiscount: { type: Number, required: true },
  discountType: { type: String, default: 'PERCENT' },
  discountPercentage: { type: Number, default: 0 },
  warrantyStatus: { type: String, enum: Object.values(WarrantyStatus), default: WarrantyStatus.PENDING },
  discountValue: { type: Number },
  docUrl: { type: String, required: true },
  sellerUid: { type: String, required: true },
  allTotal: { type: Number, required: true },
  dateOffer: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  warranty: { type: warrantyEmbedSchema, required: true },
  sellerEmbed : { type: sellerEmbedSchema, required: true },
  docNumber: { type: String, required: true },
  isArchived : { type: Boolean, default: false },
  FCMToken: { type: String },
  sellerSignature: { type: String },
  noteToCustomer: { type: String },
  noteToTeam: { type: String },
  workers: [{   type: [workerEmbedSchema] }],  
  status: {
    type: String,
    enum: Object.values(QuotationStatus),
    default: QuotationStatus.PENDING,
  },
  pdfUrl: { type: String },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});
quotationsSchema.index({ docUrl: 1 });
const Quotations = model<IQuotations>('Quotations', quotationsSchema);

export default Quotations;