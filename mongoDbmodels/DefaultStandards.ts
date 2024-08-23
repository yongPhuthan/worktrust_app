import { Schema, model, Document, Types } from 'mongoose';
import { IServiceImage } from 'types/interfaces/ServicesEmbed';
import { serviceImageSchema } from '../types/interfaces/ServicesEmbed';

export interface IDefaultStandards extends Document {
  image: IServiceImage 
  content: string;
  badStandardEffect?: string | null;
  badStandardImage?: IServiceImage | null;
  standardShowTitle?: string | null;
  created: Date | null;
  updated: Date | null;
  categories: string[] | null;
  companyId: Types.ObjectId;
}

const defaultStandardsSchema = new Schema<IDefaultStandards>({
  image: { serviceImageSchema, required: true },
  content: { type: String, required: true },
  badStandardEffect: { type: String },
  badStandardImage: { serviceImageSchema },
  standardShowTitle: { type: String },
  created: { type: Date, default: Date.now },
  categories: [{ type: String }],
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
});

const DefaultStandards = model<IDefaultStandards>('DefaultStandards', defaultStandardsSchema);

export default DefaultStandards;