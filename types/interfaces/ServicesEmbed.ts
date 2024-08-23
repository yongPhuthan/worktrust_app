
 import * as Yup from 'yup';

const serviceImageSchema = Yup.object().shape({
  id: Yup.string().required(),
  thumbnailUrl: Yup.string().required("กรุณาใส่รูปภาพ"),
  originalUrl: Yup.string().required("กรุณาใส่รูปภาพ"),
  localPathUrl: Yup.string().nullable(),
  created: Yup.date().nullable(),
});

const standardEmbedSchema = Yup.object().shape({
  id: Yup.string().required(),
  image: Yup.string().required("กรุณาใส่รูปภาพมาตรฐานของคุณ"),
  content: Yup.string().required("กรุณาใส่รายละเอียดของมาตรฐาน"),
  badStandardEffect: Yup.string().nullable(),
  badStandardImage: Yup.string().nullable(),
  standardShowTitle: Yup.string().nullable(),
});

const MaterialEmbedSchema = Yup.object().shape({
  id: Yup.string().required(""),
  name: Yup.string().required("ระบุชื่อ"),
  description: Yup.string().required("ระบุรายละเอียด"),
  image: Yup.string().required("กรุณาใส่รูปภาพ"),
});

const serviceEmbedSchema = Yup.object().shape({
  id: Yup.string().required(""),
  title: Yup.string().required("ระบุชื่อ"),
  description: Yup.string().required("ระบุรายละเอียด"),
  unitPrice: Yup.number().required("ระบุราคา"),
  qty: Yup.number().default(1),
  unit: Yup.string().default('ชุด'),
  discountType: Yup.string().oneOf(['PERCENT', 'AMOUNT']).default('PERCENT'),
  discountValue: Yup.number().default(0),
  total: Yup.number().min(0).default(0),
  standards: Yup.array().of(standardEmbedSchema).nullable(),
  serviceImages: Yup.array().of(serviceImageSchema).nullable(),
  materials: Yup.array().of(MaterialEmbedSchema).nullable(),
  created: Yup.date().nullable(),
});

type IServiceImage = Yup.InferType<typeof serviceImageSchema>;
type IStandardEmbed = Yup.InferType<typeof standardEmbedSchema>;
type IMaterialEmbed = Yup.InferType<typeof MaterialEmbedSchema>;
type IServiceEmbed = Yup.InferType<typeof serviceEmbedSchema>;

export {
  IServiceImage,
  IStandardEmbed,
  IMaterialEmbed,
  IServiceEmbed,
  serviceEmbedSchema
};
