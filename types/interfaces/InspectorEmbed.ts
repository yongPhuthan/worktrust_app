import { Schema } from 'mongoose';

interface IInspectorEmbed {
  name: string;
  image: string;
  position?: string;
  provider: string;
  providerAccountId: string;
  email: string;
}

const inspectorEmbedSchema = new Schema<IInspectorEmbed>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  position: { type: String },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  email: { type: String, required: true },
});

export { IInspectorEmbed,  inspectorEmbedSchema};