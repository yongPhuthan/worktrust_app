
import * as yup from 'yup';
import { imagesSchema } from '../../field/embed/images';

const workerSchema = yup.object().shape({
  id: yup.string().required("ระบุไอดี"),
  name: yup.string().required("ระบุชื่อ"),
  mainSkill: yup.string().required("ระบุทักษะหลัก"),
  image: imagesSchema.required("กรุณาใส่รูปภาพ"),
});

// Type for workerEmbedSchema
type WorkerSchemaType = yup.InferType<typeof workerSchema>;

export { WorkerSchemaType , workerSchema  };