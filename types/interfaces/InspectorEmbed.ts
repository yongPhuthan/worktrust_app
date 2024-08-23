// import { Schema } from 'mongoose';

// interface IInspectorEmbed {
//   name: string;
//   image: string;
//   position?: string;
//   provider: string;
//   providerAccountId: string;
//   email: string;
// }

// const inspectorEmbedSchema = new Schema<IInspectorEmbed>({
//   name: { type: String, required: true },
//   image: { type: String, required: true },
//   position: { type: String },
//   provider: { type: String, required: true },
//   providerAccountId: { type: String, required: true },
//   email: { type: String, required: true },
// });

// export { IInspectorEmbed,  inspectorEmbedSchema};

// create  Yup schema for validation same as IInspectorEmbed
import * as Yup from 'yup';

const inspectorEmbedSchema = Yup.object().shape({
  name: Yup.string().required("กรุณากรอกชื่อผู้ตรวจ"),
  image: Yup.string().required("กรุณาใส่รูปภาพ"),
  position: Yup.string().nullable(),
  provider: Yup.string().required("กรุณากรอกชื่อบริษัท"),
  providerAccountId: Yup.string().required("กรุณากรอกไอดีบริษัท"),
  email: Yup.string().required("กรุณากรอกอีเมล์"),
});

// Type for inspectorEmbedSchema
type IInspectorEmbed = Yup.InferType<typeof inspectorEmbedSchema>;


export { IInspectorEmbed, inspectorEmbedSchema };