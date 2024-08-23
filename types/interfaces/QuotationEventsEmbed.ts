import * as Yup from 'yup';

const quotationEventsEmbedSchema = Yup.object().shape({
  pageView: Yup.number().default(0),
  download: Yup.number().default(0),
  print: Yup.number().default(0),
  share: Yup.number().default(0),
  quotationId : Yup.string().required("กรุณากรอก quotationId"),
  createdAt: Yup.date().default( new Date()),
  lastOccurredAt: Yup.date().default( new Date()),
});

type IQuotationEventsEmbed = Yup.InferType<typeof quotationEventsEmbedSchema>;

export { IQuotationEventsEmbed, quotationEventsEmbedSchema };