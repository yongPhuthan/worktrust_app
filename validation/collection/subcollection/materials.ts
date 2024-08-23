import * as yup from 'yup';
import {imagesSchema} from '../../field/embed/images';

const materialSchema = yup.object().shape({
  id: yup.string().required(''),
  name: yup.string().required('ระบุชื่อ'),
  description: yup.string().required('ระบุรายละเอียด'),
  image: imagesSchema.required('ระบุรูปภาพ'),
  createAt : yup.date().required('ระบุวันที่สร้าง'),
  updateAt : yup.date().required('ระบุวันที่แก้ไข'),
});

type MaterialSchemaType = yup.InferType<typeof materialSchema>;

export {MaterialSchemaType,materialSchema};
