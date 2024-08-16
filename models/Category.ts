import { Document, Schema, Types, model } from 'mongoose';
import { IServiceImage, serviceImageSchema } from '../types/interfaces/ServicesEmbed';

export interface ICategory extends Document {
    name: string;
    images:IServiceImage[] | null;
    companyId : Types.ObjectId;
    created: Date | null;
    updated: Date | null;
}

export const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    images: { type: [serviceImageSchema] },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});
categorySchema.index({ companyId: 1 });
const Category = model<ICategory>('Category', categorySchema);

export default Category;