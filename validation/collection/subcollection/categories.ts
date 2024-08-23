import * as yup from 'yup';

const categorySchema = yup
  .object({
    id: yup.string().required(),
    name : yup.string().required(),
    createAt : yup.date().required(),
    updateAt : yup.date().required(),
  })
  .defined();

type CategorySchemaType = yup.InferType<typeof categorySchema>;

export {CategorySchemaType , categorySchema };
