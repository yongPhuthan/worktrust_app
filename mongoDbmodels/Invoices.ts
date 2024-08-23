import { Schema, model, Document, Types } from "mongoose";

import { customerEmbedSchema, ICustomerEmbed } from "../types/interfaces/CustomerEmbed";
import { customerSignEmbedSchema, ICustomerSignEmbed } from "../types/interfaces/CustomerSignEmbed";
import { InvoiceStatus } from '../types/enums';
import { IServiceEmbed, serviceEmbedSchema } from "../types/interfaces/ServicesEmbed";

export interface IInvoices extends Document {
  services: IServiceEmbed[];
  customer: ICustomerEmbed;
  customerSign?: ICustomerSignEmbed;
  vat7: number;
  taxType: string;
  taxValue: number;
  summary: number;
  summaryAfterDiscount: number;
  discountType: string;
  discountPercentage: number;
  discountValue: number;
  allTotal: number;
  dateOffer: Date;
  docNumber: string;
  FCMToken?: string;
  sellerSignature?: string;
  status?: InvoiceStatus;
  dateApproved?: Date;
  noteToCustomer?: string;
  noteToTeam?: string;
  paymentStatus?: string;
  pdfUrl?: string;
  sellerId: string;
  netAmount?: number;
  remaining?: number;
  depositPaid?: boolean;
  depositApplied?: number;
  paymentMethod?: string;
  companyId: Types.ObjectId;
  created: Date;
  updated: Date;
  quotationRefNumber?: string;
}

const invoicesSchema = new Schema<IInvoices>({
    services: {
        type: [serviceEmbedSchema],
        required: true,
      },
  customer: { type: customerEmbedSchema, required: true },
  vat7: { type: Number, required: true },
  taxType: { type: String, default: "NOTAX" },
  taxValue: { type: Number, default: 0 },
  summary: { type: Number, required: true },
  summaryAfterDiscount: { type: Number, required: true },
  discountType: { type: String, default: "PERCENT" },
  discountPercentage: { type: Number, default: 0 },
  discountValue: { type: Number },
  allTotal: { type: Number, required: true },
  dateOffer: { type: Date, required: true },
  docNumber: { type: String, required: true },
  FCMToken: { type: String },
  sellerSignature: { type: String },
  status: {
    type: String,
    enum: Object.values(InvoiceStatus),
    default: InvoiceStatus.PENDING,
  },  dateApproved: { type: Date },
  noteToCustomer: { type: String },
  noteToTeam: { type: String },
  paymentStatus: { type: String, default: "PENDING" },
  pdfUrl: { type: String },
  sellerId: { type: String, required: true },
  customerSign: {
    type: customerSignEmbedSchema,
  },
  netAmount: { type: Number },
  remaining: { type: Number },
  depositPaid: { type: Boolean, default: false },
  depositApplied: { type: Number, default: 0 },
  paymentMethod: { type: String },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  quotationRefNumber: { type: String },
});

const Invoices = model<IInvoices>("Invoices", invoicesSchema);

export default Invoices;
