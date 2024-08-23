// import { Schema } from 'mongoose';

// interface ISellerEmbed {
//   bizName: string;
//   officeTel?: string | null;
//   mobileTel?: string | null;
//   companyTax?: string | null;
//   logo?: string | null;
//   sellerName: string;
//   email?: string | null;
//   address: string;
//   jobPosition: string 
// }

// const sellerEmbedSchema = new Schema<ISellerEmbed>({
//   bizName: { type: String, required: true },
//   officeTel: { type: String },
//   mobileTel: { type: String },
//   companyTax: { type: String },
//   logo: { type: String },
//   sellerName: { type: String },
//   email: { type: String },
//   address: { type: String, required: true },
//   jobPosition: { type: String },
// });

// export { ISellerEmbed, sellerEmbedSchema };

// create  Yup schema for validation same as ISellerEmbed
import * as Yup from 'yup';

const sellerEmbedSchema = Yup.object().shape({
  bizName: Yup.string().required("กรุณากรอกชื่อบริษัท"),
  officeTel: Yup.string().nullable(),
  mobileTel: Yup.string().nullable(),
  companyTax: Yup.string().nullable(),
  logo: Yup.string().nullable(),
  sellerName: Yup.string().required("กรุณากรอกชื่อผู้ขาย"),
  email: Yup.string().nullable(),
  address: Yup.string().required("กรุณากรอกที่อยู่"),
  jobPosition: Yup.string().nullable()
});

// Type for sellerEmbedSchema
type ISellerEmbed = Yup.InferType<typeof sellerEmbedSchema>;

export { ISellerEmbed, sellerEmbedSchema };