import {
  CheckStatus,
  CustomerEmbed,
  CustomerSignEmbed,
  DiscountType,
  MaterialEmbed,
  QuotationStatus,
  Quotations,
  ReviewType,
  ReviewsEmbed,
  ServiceImagesEmbed,
  ServicesEmbed,
  StandardEmbed,
  SubmissionEmbed,
  TaxType,
  WarrantyEmbed,
  WorkStatus,
  WorkerEmbed,
  WorkerStatus,
} from '@prisma/client';
import { first } from 'lodash';
import * as yup from 'yup';
type QuotationWithoutArrays = Pick<
  Quotations,
  Exclude<keyof Quotations, 'reviews' | 'submissions'>
>;


export const customerSchemas: yup.ObjectSchema<CustomerEmbed> = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().required('ระบุชื่อลูกค้า'),
  address: yup.string().required('ระบุที่อยู่ลูกค้า'),
  customerTax: yup.string().nullable().default(null),
  phone: yup.string().required('ระบุเบอร์โทรศัพท์'),
});
export const imageTogallery = yup.object().shape({
  selectedTags: yup.array().of(yup.string().required()).required('เลือกแท็กอย่างน้อย 1 รายการ'),
  image : yup.string().required('เลือกรูปภาพผลงานของคุณ'),

});
export const standardSchema: yup.ObjectSchema<StandardEmbed> = yup
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

export const materialSchema: yup.ObjectSchema<MaterialEmbed> = yup
  .object({
    id: yup.string().required(),
    name: yup.string().required(),
    description: yup.string().required(),
    image: yup.string().required(),
    created: yup.date().required(),
    updated: yup.date().required(),
  })
  .defined();

export const serviceImagesSchema: yup.ObjectSchema<ServiceImagesEmbed> = yup
  .object({
    thumbnailUrl: yup.string().required(),
    originalUrl: yup.string().required(),
  })
  .defined();

export const servicesSchema = yup.object({
  title: yup.string().required(),
  description: yup.string().required(),
  unitPrice: yup.number().required(),
  qty: yup.number().positive().integer().required(),
  discountPercent: yup.number(),
  total: yup.number().required(),
  unit: yup.string().required(),
  serviceImages: yup.array().of(yup.string()).required('เลือกภาพตัวอย่างผลงาน'),
  standards: yup.array().of(standardSchema),
  materials: yup.array().of(materialSchema),
});

export const reviewsValidationSchema: yup.ObjectSchema<ReviewsEmbed> =
  yup.object({
    id: yup.string().required(),
    rating: yup.number().required(),
    comment: yup.string().nullable().default(null),
    socialProvider: yup.string().nullable().default(null),
    customerImage: yup.string().nullable().default(null),
    reviewType: yup
      .string()
      .default(ReviewType.OVERALL) as unknown as yup.Schema<ReviewType>,
    periodIndex: yup.number().nullable().default(null),
    createdAt: yup.date().default(() => new Date()),
    updatedAt: yup.date().nullable().default(null),
  });

export const serviceValidationSchema: yup.ObjectSchema<ServicesEmbed> =
  yup.object({
    id: yup.string().required(),
    title: yup.string().required('ระบุชื่อบริการ'),
    description: yup.string().required('ระบุคำอธิบาย'),
    unitPrice: yup.number().required('ระบุราคาต่อหน่วย').positive(),
    qty: yup.number().required('ระบุจำนวน').positive().integer().default(1),
    unit: yup.string().required('ระบุหน่วย').default('ชุด'),
    discountType: yup
      .mixed<DiscountType>()
      .oneOf(['PERCENT', 'THB', 'NONE'])
      .default('PERCENT'),
    discountValue: yup.number().required().min(0).default(0),
    total: yup.number().required('ระบุยอดรวม').positive(),
    serviceImages: yup.array().of(serviceImagesSchema).default([]), // Allow null values
    standards: yup.array().of(standardSchema).default([]), // Add default value of empty array
    materials: yup.array().of(materialSchema).default([]), // Add default value of empty array
    created: yup
      .date()
      .nullable()
      .default(() => new Date()), // Allow null values
  });

export const warrantySchemas: yup.ObjectSchema<WarrantyEmbed> = yup.object({
  id: yup.string().required('ระบุ ID'),
  productWarantyYear: yup
    .number()
    .default(0)
    .required('ระบุระยะเวลาประกันสินค้า'),
  skillWarantyYear: yup.number().required('ระบุระยะเวลาประกันบริการ'),
  fixDays: yup.number().default(0).required('ระบุจำนวนวันซ่อม'),
  condition: yup.string().required('ระบุเงื่อนไขการรับประกัน'),
  dateWaranty: yup.date().nullable().default(null),
  endWaranty: yup.date().nullable().default(null),
});

export const submissionSchemas: yup.ObjectSchema<SubmissionEmbed> = yup.object({
  id: yup.string().required('ระบุ ID'),
  address: yup.string().required('ระบุที่อยู่'),
  dateOffer: yup.date().required('ระบุวันที่ส่งงาน'),
  services: yup
    .array()
    .of(serviceValidationSchema)
    .required('เลือกงานที่ต้องการส่ง'),
  workStatus: yup
    .string()
    .required('ระบุสถานะงาน')
    .oneOf(Object.values(WorkStatus)),
  approvalStatus: yup
    .string()
    .required('ระบุสถานะการอนุมัติ')
    .oneOf(Object.values(CheckStatus))
    .default(CheckStatus.WAITING),
  description: yup.string().required('ระบุรายละเอียดงาน'),
  beforeImages: yup
    .array()
    .of(yup.string().required())
    .required('ระบุภาพก่อนทำงาน'),
  afterImages: yup
    .array()
    .of(yup.string().required())
    .required('ระบุภาพหลังทำงาน'),
  imageCustomer: yup.string().nullable().default(null),
  customerFeedback: yup.string().nullable().default(null),
  createdAt: yup.date().default(() => new Date()),
  updatedAt: yup.date().default(() => new Date()),
  periodIndex: yup.number().nullable().default(0),
});

export const customerSignSchema: yup.ObjectSchema<CustomerSignEmbed> = yup.object({
  id: yup.string().nullable().required(),
  customerType: yup.string().nullable().required(),
  customerNameSign: yup.string().nullable().required(),
  customerSignature: yup.string().nullable().required(),
  customerDateSignQuotation: yup.date().nullable().required(),
  customerPosition: yup.string().nullable().required(),
  emailCustomerApproved: yup.string().email().nullable().required(),
});

export const workerSchema: yup.ObjectSchema<WorkerEmbed> = yup.object({
  id: yup.string().required('ระบุ ID'),
  name: yup.string().required('ระบุชื่อ'),
  mainSkill: yup.string().required('ระบุทักษะหลัก'),
  workerStatus: yup.string().oneOf(Object.values(WorkerStatus)).required('ระบุสถานะของคนงาน'),
  image: yup.string().required('ระบุรูปภาพ'),
});
export const quotationsValidationSchema: yup.ObjectSchema<QuotationWithoutArrays> = yup
  .object()
  .shape({
    id: yup.string().required('ID is required'),
    customer: customerSchemas.required(),
    customerSign : customerSignSchema,
    vat7: yup.number().default(0),
    taxType: yup.mixed<TaxType>().oneOf(Object.values(TaxType)).required('ระบุประเภทภาษี').default(TaxType.NOTAX),
    taxValue: yup.number().required().default(0),
    summary: yup.number().required(),
    summaryAfterDiscount: yup.number().required(),
    companyId: yup.string().required(),
    created: yup.date().default(() => new Date()).required('ระบุวันที่สร้าง'),
    updated: yup.date().default(() => new Date()),
    discountValue: yup.number().nullable().default(null),
    deposit : yup.object({
      firstDeposit: yup.number().default(0),
      finalDeposit: yup.number().default(0),  
    }),
    allTotal: yup.number().required(),
    noteToCustomer: yup.string().nullable().default(null),
    noteToTeam: yup.string().nullable().default(null),
    status: yup.string().required().oneOf(Object.values(QuotationStatus)).default(QuotationStatus.PENDING),
    dateApproved: yup.date().nullable().default(null),
    workers: yup.array().of(workerSchema).required(),
    pdfUrl: yup.string().nullable().default(null),
    sellerId: yup.string().nullable().default(null),
    warranty: warrantySchemas,
    dateOffer: yup.date().required('เลือกวันที่เสนอราคา'),
    discountPercentage: yup.number().default(0),
    discountType: yup.string().nullable().oneOf(Object.values(DiscountType)).default(DiscountType.PERCENT),
    dateEnd: yup.date().required('เลือกวันที่สิ้นสุด'),
    docNumber: yup.string().required('ระบุเลขที่เอกสาร'),
    FCMToken: yup.string().default('none'),
    sellerSignature: yup.string().default('none'),
    services: yup
      .array()
      .of(serviceValidationSchema)
      .required('เพิ่มบริการอย่างน้อย 1 รายการ')
      .min(1, 'ต้องเลือกบริการอย่างน้อย 1 รายการ'),
  });



export const signupMobilevalidationSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required('ระบุหมายเลขโทรศัพท์')
    .min(10, 'หมายเลขโทรศัพท์อย่างน้อย 10 หลัก')
    .max(10, 'หมายเลขโทรศัพท์ไม่เกิน 10 หลัก'),
});
