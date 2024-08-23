import { Schema, model, Document, Types } from 'mongoose';
import { IServiceImage, serviceImageSchema } from '../types/interfaces/ServicesEmbed';

export interface IMaterials extends Document {
  _id? : Types.ObjectId | null
  name: string;
  description: string;
  image: IServiceImage;
  created: Date;
  updated: Date;
  companyId: Types.ObjectId;
}

export const materialsSchema = new Schema<IMaterials>({
  _id : {type: Types.ObjectId},
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: serviceImageSchema, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
});

const Materials = model<IMaterials>('Materials', materialsSchema);

export default Materials;