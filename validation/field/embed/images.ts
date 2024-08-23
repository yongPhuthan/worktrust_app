import * as yup from 'yup';

const imagesSchema = yup
  .object({
    id: yup.string().required(),
    thumbnailUrl: yup.string().required(),
    originalUrl: yup.string().required(),
    localPathUrl: yup.string().nullable().default(null),
    createAt: yup.date().required(' not found created date'),
  })
  .defined();

type ImagesSchemaType = yup.InferType<typeof imagesSchema>;

export {ImagesSchemaType, imagesSchema};
