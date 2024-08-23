import * as Yup from 'yup';

const warrantySchema = Yup.object().shape({
    
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

type WarrantySchemaType = Yup.InferType<typeof warrantySchema>;

export { WarrantySchemaType , warrantySchema };