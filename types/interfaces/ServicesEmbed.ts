import { Schema, Types } from 'mongoose';
import { DiscountType } from 'types/enums';

interface IServiceImage {

  thumbnailUrl: string;
  originalUrl: string;
  localPathUrl: string;
  created: Date | null;
}

interface IStandardEmbed {
  id: string;
  image: string;
  content: string;
  badStandardEffect?: string | null;
  badStandardImage?: string | null;
  standardShowTitle?: string | null;
}

interface IMaterialEmbed {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface IServiceEmbed {
  id: string;
  title: string;
  description: string;
  unitPrice: number;
  qty: number;
  unit: string;
  discountType: DiscountType;
  discountValue: number;
  total: number;
  standards: IStandardEmbed[] | null;
  serviceImages: IServiceImage[] | null;
  materials: IMaterialEmbed[] | null;
  created?: Date | null;
}

export const serviceImageSchema = new Schema<IServiceImage>({
  id: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  originalUrl: { type: String, required: true },
  localPathUrl: { type: String },
  created: { type: Date, default: Date.now },

});

const standardEmbedSchema = new Schema<IStandardEmbed>({
  id: { type: String, required: true },
  image: { type: String, required: true },
  content: { type: String, required: true },
  badStandardEffect: { type: String },
  badStandardImage: { type: String },
  standardShowTitle: { type: String },
});

const MaterialEmbedSchema = new Schema<IMaterialEmbed>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

const serviceEmbedSchema = new Schema<IServiceEmbed>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  qty: { type: Number, default: 1 },
  unit: { type: String, default: 'ชุด' },
  discountType: { type: String, enum: DiscountType, default: DiscountType.PERCENT },
  discountValue: { type: Number, default: 0 },
  total: { type: Number, required: true },
  standards: [standardEmbedSchema],
  serviceImages: [serviceImageSchema],
  materials: [MaterialEmbedSchema],
  created: { type: Date, default: Date.now },
});

export {
  IServiceImage,
  IStandardEmbed,
  IMaterialEmbed,
  IServiceEmbed,
serviceEmbedSchema
};