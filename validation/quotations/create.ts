import { IQuotations } from '../../models/Quotations';
import * as yup from 'yup';
import {doc, FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import  {IWorkerEmbed, workerEmbedSchema}  from '../../types/interfaces/WorkerEmbed';
import {IQuotationEventsEmbed,} from '../../types/interfaces/QuotationEventsEmbed';
import {ICustomerSignEmbed} from '../../types/interfaces/CustomerSignEmbed';
import {ICustomerEmbed} from '../../types/interfaces/CustomerEmbed';
import {IMaterialEmbed, IServiceEmbed, IServiceImage, IStandardEmbed} from '../../types/interfaces/ServicesEmbed';
import {ISellerEmbed} from '../../types/interfaces/SellerEmbed';

import {IWarrantyEmbed} from '../../types/interfaces/WarrantyEmbed';

import {
  DiscountType,
  QuotationStatus,
  TaxType,
  WarrantyStatus,
  WorkerStatus,
} from '../../types/enums';


export const workerSchema: yup.ObjectSchema<IWorkerEmbed> = yup.object({
  id : yup.string().required('ระบุ ID'),
  name: yup.string().required('ระบุชื่อ'),
  mainSkill: yup.string().required('ระบุทักษะหลัก'),
  companyId : yup.string().required('ระบุบริษัท'),
  workerStatus: yup
    .string()
    .oneOf(Object.values(WorkerStatus))
    .required('ระบุสถานะของพนักงาน'),
  image: yup.string().required('อัพโหลดรูปภาพพนักงาน'),
});
export const quotationEventsEmbed: yup.ObjectSchema<IQuotationEventsEmbed> = yup
  .object()
  .shape({
    pageView: yup.number().default(0),
    download: yup.number().default(0),
    print: yup.number().default(0),
    share: yup.number().default(0),
    createdAt: yup.date().required(),
    lastOccurredAt: yup.date().required(),
  });

export const customerSignSchema: yup.ObjectSchema<ICustomerSignEmbed> =
  yup.object({
    id: yup.string().nullable().required(),
    customerType: yup.string().nullable().required(),
    customerNameSign: yup.string().nullable().required(),
    customerSignature: yup.string().nullable().required(),
    customerDateSignQuotation: yup.date().required(),
    customerPosition: yup.string().nullable().required(),
    emailCustomerApproved: yup.string().email().required(),
  });
export const warrantySchemas: yup.ObjectSchema<IWarrantyEmbed> = yup.object({
  id: yup.string().nullable().default(null),
  sellerSignature: yup.string().nullable().default(null),
  productWarrantyMonth: yup
    .number()
    .required('ระบุจำนวนเดือนของการรับประกันสินค้า')
    .moreThan(0, 'การรับประกันสินค้าต้องมากกว่า 0 เดือน'),
  skillWarrantyMonth: yup
    .number()
    .required('ระบุจำนวนเดือนของการรับประกันฝีมือ')
    .moreThan(0, 'การรับประกันฝีมือต้องมากกว่า 0 เดือน'),
  pdfUrl: yup.string().nullable().default(null),
  fixDays: yup.number().default(0).required('ระบุจำนวนวันซ่อม'),
  condition: yup.string().required('ระบุเงื่อนไขการรับประกัน'),
  dateWarranty: yup.date().nullable().default(null),
  endProductWarranty: yup.date().nullable().default(null),
  endSkillWarranty: yup.date().nullable().default(null),
});

export const customerSchemas: yup.ObjectSchema<ICustomerEmbed> = yup.object({
  name: yup.string().required('ระบุชื่อลูกค้า'),
  address: yup.string().required('ระบุที่อยู่ลูกค้า'),
  customerTax: yup.string().nullable().default(null),
  phone: yup.string().nullable().default(null),
});

export const serviceImagesSchema: yup.ObjectSchema<IServiceImage> = yup
  .object({
    thumbnailUrl: yup.string().required(),
    originalUrl: yup.string().required(),
    localPathUrl: yup.string().nullable().default(null),
    created : yup.date().required(" not found created date"),
  })
  .defined();

export const standardEmbedSchema: yup.ObjectSchema<IStandardEmbed> = yup
  .object({
    id: yup.string().required(),
    image: yup.string().required(),
    content: yup.string().required(),
    badStandardEffect: yup.string().nullable().default(null),
    badStandardImage: yup.string().nullable().default(null),
    standardShowTitle: yup.string().nullable().default(null),
    created: yup.date().required(),
    updated: yup.date().required(),
  })
  .defined(); // Add .defined() to remove undefined from the schema

export const materialSchema: yup.ObjectSchema<IMaterialEmbed> = yup
  .object({
    id: yup.string().required(),
    name: yup.string().required(),
    description: yup.string().required(),
    companyId: yup.string().required(),
    image: yup.string().required(),
    // created: fieldValueSchema.nullable().default(null),
    // updated: fieldValueSchema.nullable().default(null),
  })
  .defined();

export const serviceValidationSchema: yup.ObjectSchema<IServiceEmbed> =
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
    serviceImages: yup.array().of(serviceImagesSchema).default([]),
    standards: yup.array().of(standardEmbedSchema).default([]),
    materials: yup.array().of(materialSchema).default([]),
    created: yup.date().nullable().default(null),
  });
export const SellerEmbedSchema: yup.ObjectSchema<ISellerEmbed> = yup
  .object()
  .shape({
    bizName: yup.string().required('ระบุชื่อบริษัท'),
    officeTel: yup.string().nullable().default(null),
    mobileTel: yup.string().nullable().default(null),
    companyTax: yup.string().nullable().default(null),
    logo: yup.string().nullable().default(null),
    sellerName: yup.string().required(),
    email: yup.string().email().nullable().default(null),
    address: yup.string().required('ระบุที่อยู่'),
    jobPosition: yup.string().required('ระบุตำแหน่งงาน'),
  });

export const CreateQuotationSchema: yup.ObjectSchema<any> = yup
  .object()
  .shape({

    customer: customerSchemas.required("ไม่พบข้อมูลลูกค้า"),
    vat7: yup.number().default(0),
    sellerEmbed: SellerEmbedSchema.required(),
    isArchived: yup.boolean().default(false),
    
    events: quotationEventsEmbed.nullable().default(null),
    // isArchived: yup.boolean().default(false),
    services: yup
      .array()
      .of(serviceValidationSchema)
      .required('เพิ่มบริการอย่างน้อย 1 รายการ')
      .min(1, 'ต้องเลือกบริการอย่างน้อย 1 รายการ'),
    
    taxType: yup
      .mixed<TaxType>()
      .oneOf(Object.values(TaxType))
      .required('ระบุประเภทภาษี')
      .default(TaxType.NOTAX),
    taxValue: yup.number().required().default(0),
    summary: yup.number().required(),
    summaryAfterDiscount: yup.number().required(),
    companyId: yup.string().required("ไม่พบ ID ของบริษัท"),
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
    docUrl : yup.string().required('ไม่มี URL ของเอกสาร'),
    warranty: warrantySchemas.required(),
    dateOffer: 
      yup.date().required('ระบุวันที่เสนอราคา'),
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
    docNumber: yup.string().required('ระบุเลขที่เอกสาร'),
    created: yup.date().nullable().default(null),
    updated: yup.date().nullable().default(null),
    FCMToken: yup.string().required('ระบุ FCM Token'),
    sellerSignature: yup
      .string()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
  })
  .strict();

  export const QuotationValidationSchema = CreateQuotationSchema.omit(
    ['id', 'pdfUrl', 'created', 'updated', 'sellerSignature'],
  
  )

export const CompanyValidateSchema = yup
  .object()
  .shape({
    id: yup.string().required('ไม่มี ID'),
    code: yup.string().required('ไม่มีรหัสบริษัท'),
    bizName: yup.string().required('ไม่มีชื่อบริษัท'),
    address: yup.string().required('ไม่มีที่อยู่บริษัท'),
    defaultWarranty: yup.array().of(warrantySchemas).nullable().default([]),
    logo: yup
      .string()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
    mobileTel: yup
      .string()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
    officeTel: yup
      .string()
      .nullable()
      .default(null)
      .transform(value => (value === '' ? null : value)),
  })
  .strict();

// combind schema and type
export type CreateQuotationSchemaType = yup.InferType<
  typeof CreateQuotationSchema
>;
export type CustomerEmbedType = yup.InferType<typeof customerSchemas>;
export type ServiceImagesEmbedType = yup.InferType<typeof serviceImagesSchema>;
export type StandardEmbedType = yup.InferType<typeof standardEmbedSchema>;
export type MaterialType = yup.InferType<typeof materialSchema>;
export type ServiceType = yup.InferType<typeof serviceValidationSchema>;
export type SellerEmbedType = yup.InferType<typeof SellerEmbedSchema>;
export type WarrantyType = yup.InferType<typeof warrantySchemas>;
export type QuotationEventsEmbedType = yup.InferType<
  typeof quotationEventsEmbed
>;
export type WorkerType = yup.InferType<typeof workerSchema>;
export type CompanyValidateSchemaType = yup.InferType<
  typeof CompanyValidateSchema
>;
export type QuotationValidationSchemaType = yup.InferType<
  typeof QuotationValidationSchema 
>;
