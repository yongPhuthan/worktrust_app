import * as Yup from 'yup';
import { imagesSchema } from '../../field/embed/images';

const standardSchema = Yup.object().shape({
    id: Yup.string().required(),
    image: imagesSchema.required('ระบุรูปภาพ'),
    content: Yup.string().required("กรุณาใส่รายละเอียดของมาตรฐาน"),
    badStandardEffect: Yup.string().nullable(),
    badStandardImage: imagesSchema.nullable(),
    standardShowTitle: Yup.string().nullable(),
    createAt : Yup.date().nullable(),
    updateAt : Yup.date().nullable(),
  });

  type StandardSchemaType = Yup.InferType<typeof standardSchema>;

export { StandardSchemaType, standardSchema };