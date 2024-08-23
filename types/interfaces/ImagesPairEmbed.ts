// import { Schema } from 'mongoose';

// interface ISubmissionBeforeImagesEmbed {
//   thumbnailUrl: string;
//   originalUrl: string;
// }



// interface ISubmissionAfterImagesEmbed {
//   thumbnailUrl: string;
//   originalUrl: string;
// }

// interface ISubmissionImagesPairEmbed {
//   beforeImages: ISubmissionBeforeImagesEmbed[];
//   afterImages: ISubmissionAfterImagesEmbed[];
// }

// const SubmissionBeforeImagesEmbedSchema = new Schema<ISubmissionBeforeImagesEmbed>({
//   thumbnailUrl: { type: String, required: true },
//   originalUrl: { type: String, required: true },
// });

// const SubmissionAfterImagesEmbedSchema = new Schema<ISubmissionAfterImagesEmbed>({
//   thumbnailUrl: { type: String, required: true },
//   originalUrl: { type: String, required: true },
// });

// const SubmissionImagesPairEmbedSchema = new Schema<ISubmissionImagesPairEmbed>({
//   beforeImages: [SubmissionBeforeImagesEmbedSchema],
//   afterImages: [SubmissionAfterImagesEmbedSchema],
// });

// export {
//   ISubmissionBeforeImagesEmbed,
//   ISubmissionAfterImagesEmbed,
//   ISubmissionImagesPairEmbed,
//   SubmissionBeforeImagesEmbedSchema ,
//   SubmissionAfterImagesEmbedSchema ,
//  SubmissionImagesPairEmbedSchema
// };

// create  Yup schema for validation same as ISubmissionImagesPairEmbed
import * as Yup from 'yup';

const SubmissionBeforeImagesEmbedSchema = Yup.object().shape({
  thumbnailUrl: Yup.string().required("กรุณาใส่รูปภาพก่อนทำงาน"),
  originalUrl: Yup.string().required("กรุณาใส่รูปภาพก่อนทำงาน"),
});

const SubmissionAfterImagesEmbedSchema = Yup.object().shape({
  thumbnailUrl: Yup.string().required("กรุณาใส่รูปภาพหลังทำงาน"),
  originalUrl: Yup.string().required("กรุณาใส่รูปภาพหลังทำงาน"),
});

const SubmissionImagesPairEmbedSchema = Yup.object().shape({
  beforeImages: Yup.array().of(SubmissionBeforeImagesEmbedSchema).required("กรุณาใส่รูปภาพ"),
  afterImages: Yup.array().of(SubmissionAfterImagesEmbedSchema).required("กรุณาใส่รูปภาพ"),
});

// Type for all schema
type ISubmissionImagesPairEmbed = Yup.InferType<typeof SubmissionImagesPairEmbedSchema>;
type ISubmissionBeforeImagesEmbed = Yup.InferType<typeof SubmissionBeforeImagesEmbedSchema>;
type ISubmissionAfterImagesEmbed = Yup.InferType<typeof SubmissionAfterImagesEmbedSchema>;



export {
  ISubmissionImagesPairEmbed,
  ISubmissionBeforeImagesEmbed,
  ISubmissionAfterImagesEmbed,
  SubmissionBeforeImagesEmbedSchema,
  SubmissionAfterImagesEmbedSchema,
  SubmissionImagesPairEmbedSchema
};