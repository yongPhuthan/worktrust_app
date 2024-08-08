import { Schema } from 'mongoose';

interface IQuotationEventsEmbed {
  pageView: number;
  download: number;
  print: number;
  share: number;
  createdAt: Date;
  lastOccurredAt: Date;
}

const quotationEventsEmbedSchema = new Schema<IQuotationEventsEmbed>({
  pageView: { type: Number, default: 0 },
  download: { type: Number, default: 0 },
  print: { type: Number, default: 0 },
  share: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastOccurredAt: { type: Date, default: Date.now },
});

export { IQuotationEventsEmbed, quotationEventsEmbedSchema };