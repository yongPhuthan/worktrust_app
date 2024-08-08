import { Schema } from 'mongoose';

interface ICustomerEmbed {
  name: string;
  address: string;
  customerTax?: string | null;
  phone?: string | null;
}

const customerEmbedSchema = new Schema<ICustomerEmbed>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  customerTax: { type: String },
  phone: { type: String },
});

export { ICustomerEmbed, customerEmbedSchema  };