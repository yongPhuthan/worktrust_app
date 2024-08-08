import { Schema } from 'mongoose';

interface ISellerEmbed {
  bizName: string;
  officeTel?: string | null;
  mobileTel?: string | null;
  companyTax?: string | null;
  logo?: string | null;
  sellerName: string;
  email?: string | null;
  address: string;
  jobPosition: string 
}

const sellerEmbedSchema = new Schema<ISellerEmbed>({
  bizName: { type: String, required: true },
  officeTel: { type: String },
  mobileTel: { type: String },
  companyTax: { type: String },
  logo: { type: String },
  sellerName: { type: String },
  email: { type: String },
  address: { type: String, required: true },
  jobPosition: { type: String },
});

export { ISellerEmbed, sellerEmbedSchema };