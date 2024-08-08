import { Schema } from 'mongoose';

interface IRejectEmbed {
  images: string[];
  comment: string;
}

const rejectEmbedSchema = new Schema<IRejectEmbed>({
  images: [{ type: String, required: true }],
  comment: { type: String, required: true },
});

export { IRejectEmbed, rejectEmbedSchema };