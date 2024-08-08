import { Schema } from 'mongoose';

interface IReviewsEmbed {
  id: string;
  overallRating: number;
  qualityRating: number;
  materialRating: number;
  timelinessRating: number;
  communicationRating: number;
  comment?: string;
  socialProvider?: 'LINE' | 'FACEBOOK' | 'GOOGLE';
  inspectorName?: string;
  inspectorPosition?: string;
  inspectorImage?: string;
  inspectorEmail?: string;
  inspectorSocialName?: string;
  periodIndex?: number;
  createdAt: Date;
}

const reviewsEmbedSchema = new Schema<IReviewsEmbed>({
  id: { type: String, required: true },
  overallRating: { type: Number, required: true },
  qualityRating: { type: Number, required: true },
  materialRating: { type: Number, required: true },
  timelinessRating: { type: Number, required: true },
  communicationRating: { type: Number, required: true },
  comment: { type: String },
  socialProvider: { type: String, enum: ['LINE', 'FACEBOOK', 'GOOGLE'], default: 'LINE' },
  inspectorName: { type: String },
  inspectorPosition: { type: String },
  inspectorImage: { type: String },
  inspectorEmail: { type: String },
  inspectorSocialName: { type: String },
  periodIndex: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export { IReviewsEmbed, reviewsEmbedSchema  };