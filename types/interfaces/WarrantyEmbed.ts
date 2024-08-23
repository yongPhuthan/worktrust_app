// import { Schema } from 'mongoose';

// interface IWarrantyEmbed {
//   skillWarrantyMonth: number;
//   productWarrantyMonth: number;
//   fixDays: number;
//   dateWarranty?: Date | null;
//   endSkillWarranty?: Date | null;
//   endProductWarranty?: Date | null;
//   condition: string;
//   pdfUrl?: string | null; 
//   sellerSignature?: string | null;
// }

// const warrantyEmbedSchema = new Schema<IWarrantyEmbed>({
//   skillWarrantyMonth: { type: Number, default: 0 },
//   productWarrantyMonth: { type: Number, required: true },
//   fixDays: { type: Number, default: 0 },
//   dateWarranty: { type: Date },
//   endSkillWarranty: { type: Date },
//   endProductWarranty: { type: Date },
//   condition: { type: String, required: true },
//   pdfUrl: { type: String },
//   sellerSignature: { type: String },
// });

// export { IWarrantyEmbed,  warrantyEmbedSchema  };
// create  Yup schema for validation same as IWarrantyEmbed

import * as Yup from 'yup';

const warrantyEmbedSchema = Yup.object().shape({
  skillWarrantyMonth: Yup.number().default(0),
  productWarrantyMonth: Yup.number().required("กรุณากรอกเดือนรับประกันสินค้า"),
  fixDays: Yup.number().default(0),
  dateWarranty: Yup.date().nullable(),
  endSkillWarranty: Yup.date().nullable(),
  endProductWarranty: Yup.date().nullable(),
  condition: Yup.string().required("กรุณากรอกเงื่อนไขการรับประกันสินค้า"),
  pdfUrl: Yup.string().nullable(),
  sellerSignature: Yup.string().nullable(),
});

type IWarrantyEmbed = Yup.InferType<typeof warrantyEmbedSchema>;

export { IWarrantyEmbed, warrantyEmbedSchema };