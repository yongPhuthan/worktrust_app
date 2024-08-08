import { Schema, model, Document, Types } from 'mongoose';

export interface IDefaultStandards extends Document {
  image?: string 
  content: string;
  badStandardEffect?: string | null;
  badStandardImage?: string | null;
  standardShowTitle?: string | null;
  createdAt: Date;
  tags: string[];
  companyId: Types.ObjectId;
}

const defaultStandardsSchema = new Schema<IDefaultStandards>({
  image: { type: String },
  content: { type: String, required: true },
  badStandardEffect: { type: String },
  badStandardImage: { type: String },
  standardShowTitle: { type: String },
  createdAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
});

const DefaultStandards = model<IDefaultStandards>('DefaultStandards', defaultStandardsSchema);

export default DefaultStandards;