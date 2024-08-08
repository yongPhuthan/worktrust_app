import { Schema } from 'mongoose';

interface IWarrantyEmbed {
  skillWarrantyMonth: number;
  productWarrantyMonth: number;
  fixDays: number;
  dateWarranty?: Date | null;
  endSkillWarranty?: Date | null;
  endProductWarranty?: Date | null;
  condition: string;
  pdfUrl?: string | null; 
  sellerSignature?: string | null;
}

const warrantyEmbedSchema = new Schema<IWarrantyEmbed>({
  skillWarrantyMonth: { type: Number, default: 0 },
  productWarrantyMonth: { type: Number, required: true },
  fixDays: { type: Number, default: 0 },
  dateWarranty: { type: Date },
  endSkillWarranty: { type: Date },
  endProductWarranty: { type: Date },
  condition: { type: String, required: true },
  pdfUrl: { type: String },
  sellerSignature: { type: String },
});

export { IWarrantyEmbed,  warrantyEmbedSchema  };