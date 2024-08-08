import { Schema } from 'mongoose';

interface ISubmissionBeforeImagesEmbed {
  thumbnailUrl: string;
  originalUrl: string;
}



interface ISubmissionAfterImagesEmbed {
  thumbnailUrl: string;
  originalUrl: string;
}

interface ISubmissionImagesPairEmbed {
  beforeImages: ISubmissionBeforeImagesEmbed[];
  afterImages: ISubmissionAfterImagesEmbed[];
}

const SubmissionBeforeImagesEmbedSchema = new Schema<ISubmissionBeforeImagesEmbed>({
  thumbnailUrl: { type: String, required: true },
  originalUrl: { type: String, required: true },
});

const SubmissionAfterImagesEmbedSchema = new Schema<ISubmissionAfterImagesEmbed>({
  thumbnailUrl: { type: String, required: true },
  originalUrl: { type: String, required: true },
});

const SubmissionImagesPairEmbedSchema = new Schema<ISubmissionImagesPairEmbed>({
  beforeImages: [SubmissionBeforeImagesEmbedSchema],
  afterImages: [SubmissionAfterImagesEmbedSchema],
});

export {
  ISubmissionBeforeImagesEmbed,
  ISubmissionAfterImagesEmbed,
  ISubmissionImagesPairEmbed,
  SubmissionBeforeImagesEmbedSchema ,
  SubmissionAfterImagesEmbedSchema ,
 SubmissionImagesPairEmbedSchema
};