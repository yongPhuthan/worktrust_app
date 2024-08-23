import * as Yup from 'yup';

const customerEmbedSchema = Yup.object().shape({
  name: Yup.string().required("กรุณากรอกชื่อลูกค้า"),
  address: Yup.string().required("กรุณากรอกที่อยู่"),
  customerTax: Yup.string().nullable(),
  phone: Yup.string().nullable(),
});

// Type for customerEmbedSchema
type CustomerEmbedSchemaType = Yup.InferType<typeof customerEmbedSchema>;

export { CustomerEmbedSchemaType , customerEmbedSchema };

