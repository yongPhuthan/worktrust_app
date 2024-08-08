import { Schema } from 'mongoose';

interface ICustomerSignEmbed {
  id?: string;
  customerType?: string;
  customerNameSign?: string;
  customerSignature?: string;
  customerDateSignQuotation?: Date;
  customerPosition?: string;
  emailCustomerApproved?: string;
}

const customerSignEmbedSchema = new Schema<ICustomerSignEmbed>({
  id: { type: String },
  customerType: { type: String },
  customerNameSign: { type: String },
  customerSignature: { type: String },
  customerDateSignQuotation: { type: Date },
  customerPosition: { type: String },
  emailCustomerApproved: { type: String },
});

export { ICustomerSignEmbed, customerSignEmbedSchema };