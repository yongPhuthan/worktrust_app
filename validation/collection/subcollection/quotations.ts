import * as yup from 'yup';

import {
  DiscountType,
  QuotationStatus,
  TaxType,
  WarrantyStatus,
} from '../../../types/enums';
import {serviceSchema} from '../../field/services';
import {workerSchema} from './workers';
import {warrantySchema} from './warranty';
import {customerEmbedSchema} from '../../field/embed/customerEmbed';
import {sellerEmbedSchema} from '../../field/embed/sellerEmbed';

export const quotationSchema = yup
  .object()
  .shape({
    id: yup.string().required('ไม่พบ ID ของใบเสนอราคา'),
    customer: customerEmbedSchema.required('ไม่พบข้อมูลลูกค้า'),
    vat7: yup.number().default(0),
    sellerEmbed: sellerEmbedSchema.required(),
    isArchived: yup.boolean().default(false),
    services: yup
      .array()
      .of(serviceSchema)
      .required('เพิ่มบริการอย่างน้อย 1 รายการ')
      .min(1, 'ต้องเลือกบริการอย่างน้อย 1 รายการ'),

    taxType: yup
      .mixed<TaxType>()
      .oneOf(Object.values(TaxType))
      .required('ระบุประเภทภาษี')
      .default(TaxType.NOTAX),
    taxValue: yup.number().required().default(0),
    summary: yup.number().required(),
    docNumber: yup.string().required('กรุณากรอกเลขที่เอกสาร'),
    summaryAfterDiscount: yup.number().required(),
    companyId: yup.string().required('ไม่พบ ID ของบริษัท'),
    discountValue: yup
      .number()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
    allTotal: yup.number().required(),
    noteToCustomer: yup
      .string()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
    noteToTeam: yup
      .string()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
    status: yup
      .string()
      .required()
      .oneOf(Object.values(QuotationStatus))
      .default(QuotationStatus.PENDING),
    workers: yup.array().of(workerSchema).nullable().default(null),
    pdfUrl: yup.string().nullable().default(null),
    sellerUid: yup.string().required('ไม่มี ID ของผู้ขาย'),
    docUrl: yup.string().required('ไม่มี URL ของเอกสาร'),
    warranty: warrantySchema.required(),
    dateOffer: yup.date().required('ระบุวันที่เสนอราคา'),
    warrantyStatus: yup
      .string()
      .required()
      .oneOf(Object.values(WarrantyStatus))
      .default(WarrantyStatus.PENDING),
    discountPercentage: yup
      .number()
      .default(0)
      .nullable()
      .transform(value => (value === '' ? null : value)),
    discountType: yup
      .string()
      .oneOf(Object.values(DiscountType))
      .default(DiscountType.PERCENT),
    dateEnd: yup.date().required('ระบุวันที่สิ้นสุด'),
    dateEndUTC: yup
      .date()
      .required('กรุณากรอกวันที่หมดอายุในรูปแบบ UTC')
      .transform(value => value && new Date(value).toISOString()),
    createAt: yup.date().nullable().default(null),
    updateAt: yup.date().nullable().default(null),
    FCMToken: yup.string().required('ระบุ FCM Token'),
    sellerSignature: yup
      .string()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
  })
  .strict();

// combind schema and type
export type QuotationSchemaType = yup.InferType<typeof quotationSchema>;
