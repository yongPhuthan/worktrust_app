import * as yup from 'yup';
export const imagesSetSchema = yup.object().shape({
  id: yup.string().nullable(),
  thumbnailUrl: yup.string().required('Thumbnail URL is required'),
  originalUrl: yup.string().required('Original URL is required'),
  localPathUrl : yup.string().nullable(),
  created: yup.date().nullable(),
});
export const materialSchema = yup
  .object()
  .shape({
    id: yup.string().nullable(),
    image: imagesSetSchema.required('กรุณาใส่รูปภาพ'),
    description: yup.string().required('กรุณาใส่รายละเอียดวัสดุอุปกรณ์'),
    name: yup.string().required('กรุณาใส่ชื่อวัสดุอุปกรณ์'),
    created: yup.date().nullable(),
    updated: yup.date().nullable(),
    companyId: yup
      .string()
      .required('กรุณาใส่รหัสบริษัทของคุณ')
      .matches(/^[0-9a-fA-F]{24}$/, 'รูปแบบไม่ถูกต้อง(objectId)'),
  })
  .strict();

// combind schema and type
export type MaterialSchemaType = yup.InferType<typeof materialSchema>;
