import * as yup from 'yup';

const projectImageSchema = yup
  .object({
    id: yup.string().required(),
    thumbnailUrl: yup.string().required(),
    originalUrl: yup.string().required(),
    localPathUrl: yup.string().nullable().default(null),
    createAt: yup.date().required(' not found created date'),
    categoryIds: yup.array().of(yup.string()).required('not found categoryIds'),
  })
  .defined();

type ProjectImagesSchemaType = yup.InferType<typeof projectImageSchema>;

export {ProjectImagesSchemaType , projectImageSchema};
