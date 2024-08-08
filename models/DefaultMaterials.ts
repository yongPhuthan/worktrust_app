import { Schema, model, Document, Types } from 'mongoose';

export interface IDefaultMaterials extends Document {
  name: string;
  description: string;
  image: string;
  created: Date;
  updated: Date;
  companyId: Types.ObjectId;
}

export const defaultMaterialsSchema = new Schema<IDefaultMaterials>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
});

const DefaultMaterials = model<IDefaultMaterials>('DefaultMaterials', defaultMaterialsSchema);

export default DefaultMaterials;