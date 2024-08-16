import { Schema, model, Document, Types } from 'mongoose';
import { IServiceImage, serviceImageSchema } from '../types/interfaces/ServicesEmbed';

export interface IDefaultMaterials extends Document {
  name: string;
  description: string;
  image: IServiceImage;
  created: Date;
  updated: Date;
  companyId: Types.ObjectId;
}

export const defaultMaterialsSchema = new Schema<IDefaultMaterials>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: serviceImageSchema, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
});

const DefaultMaterials = model<IDefaultMaterials>('DefaultMaterials', defaultMaterialsSchema);

export default DefaultMaterials;