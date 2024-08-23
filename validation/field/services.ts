import * as yup from 'yup';
import { DiscountType } from '../../types/enums';
import { imagesSchema } from './embed/images';
import { standardSchema } from '../collection/subcollection/standard';
import { materialSchema } from '../collection/subcollection/materials';
import {projectImageSchema} from '../collection/subcollection/projectImages';
const serviceSchema =
  yup.object({
    id: yup.string().required(),
    title: yup.string().required('ระบุชื่อบริการ'),
    description: yup.string().required('ระบุคำอธิบาย'),
    unitPrice: yup.number().required('ระบุราคาต่อหน่วย').positive(),
    qty: yup.number().required('ระบุจำนวน').positive().integer().default(1),
    unit: yup.string().required('ระบุหน่วย').default('ชุด'),
    discountType: yup
      .mixed<DiscountType>()
      .oneOf(Object.values(DiscountType))
      .default(DiscountType.PERCENT),
    discountValue: yup.number().required().min(0).default(0),
    total: yup.number().required('ระบุยอดรวม').positive(),
    images: yup.array().of(projectImageSchema).default([]),
    standards: yup.array().of(standardSchema).default([]),
    materials: yup.array().of(materialSchema).default([]),
    created: yup.date().nullable().default(null),
  });

type ServiceSchemaType = yup.InferType<typeof serviceSchema>;

export { ServiceSchemaType, serviceSchema };