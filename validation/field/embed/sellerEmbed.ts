import * as Yup from 'yup';
import { imagesSchema } from './images';

const sellerEmbedSchema = Yup.object().shape({
  bizName: Yup.string().required("กรุณากรอกชื่อบริษัท"),
  officeTel: Yup.string().nullable(),
  mobileTel: Yup.string().nullable(),
  companyTax: Yup.string().nullable(),
  logo: imagesSchema.nullable(),
  sellerName: Yup.string().required("กรุณากรอกชื่อผู้ขาย"),
  email: Yup.string().nullable(),
  address: Yup.string().required("กรุณากรอกที่อยู่"),
  jobPosition: Yup.string().nullable()
});

// Type for sellerEmbedSchema
type SellerEmbedSchemaType = Yup.InferType<typeof sellerEmbedSchema>;

export { SellerEmbedSchemaType , sellerEmbedSchema };