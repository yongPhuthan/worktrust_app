// import { Schema } from 'mongoose';

// interface ICustomerSignEmbed {
//   id?: string;
//   customerType?: string;
//   customerNameSign?: string;
//   customerSignature?: string;
//   customerDateSignQuotation?: Date;
//   customerPosition?: string;
//   emailCustomerApproved?: string;
// }

// const customerSignEmbedSchema = new Schema<ICustomerSignEmbed>({
//   id: { type: String },
//   customerType: { type: String },
//   customerNameSign: { type: String },
//   customerSignature: { type: String },
//   customerDateSignQuotation: { type: Date },
//   customerPosition: { type: String },
//   emailCustomerApproved: { type: String },
// });

// export { ICustomerSignEmbed, customerSignEmbedSchema };

// create  Yup schema for validation same as ICustomerSignEmbed
import * as Yup from 'yup';
const customerSignEmbedSchema = Yup.object().shape({
  id: Yup.string().nullable(),
  customerType: Yup.string().nullable(),
  customerNameSign: Yup.string().nullable(),
  customerSignature: Yup.string().nullable(),
  customerDateSignQuotation: Yup.date().nullable(),
  customerPosition: Yup.string().nullable(),
  emailCustomerApproved: Yup.string().nullable(),
});
type ICustomerSignEmbed = Yup.InferType<typeof customerSignEmbedSchema>;

export { ICustomerSignEmbed, customerSignEmbedSchema };