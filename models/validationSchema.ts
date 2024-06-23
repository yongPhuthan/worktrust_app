import {
 
  CustomerEmbed,
  CustomerSignEmbed,
  DiscountType,
  InspectorEmbed,
  MaterialEmbed,
  Provider,
  QuotationStatus,
  Quotations,
  RejectEmbed,
  DefaultMaterials,
  ReviewsEmbed,
  ServiceImagesEmbed,
  ServicesEmbed,
  StandardEmbed,
  SubmissionStatus,
  Submissions,
  TaxType,
  WarrantyEmbed,
  WorkStatus,
  WorkerEmbed,
  WorkerStatus,
  DefaultStandards,
  WarrantyStatus,
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

export const inspectorValidationSchema: yup.ObjectSchema<InspectorEmbed> = yup.object().shape({
  name: yup.string().required('ระบุชื่อผู้ตรวจสอบ'),
  image: yup.string().required('ระบุรูปภาพของผู้ตรวจสอบ'),
  provider: yup.string().required('ระบุผู้ให้บริการ'),
  providerAccountId: yup.string().required('ระบุ Provider Account ID'),
  email: yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').required('ระบุอีเมล'),
});

export const rejectValidationSchema: yup.ObjectSchema<RejectEmbed> = yup.object().shape({
  images: yup
    .array()
    .of(yup.string().required('รูปภาพแต่ละรูปเป็นสิ่งจำเป็น'))
    .required('ระบุรูปภาพการปฏิเสธ'),
  comment: yup.string().required('ระบุความคิดเห็นการปฏิเสธ'),
});
export const reviewValidationSchema: yup.ObjectSchema<any> = yup.object().shape({
  id: yup.string().required('ID เป็นสิ่งจำเป็น'),
  overallRating: yup.number().required('คะแนนรวมเป็นสิ่งจำเป็น').min(0).max(5),
  qualityRating: yup.number().required('คะแนนคุณภาพเป็นสิ่งจำเป็น').min(0).max(5),
  materialRating: yup.number().required('คะแนนวัสดุเป็นสิ่งจำเป็น').min(0).max(5),
  timelinessRating: yup.number().required('คะแนนตรงต่อเวลาเป็นสิ่งจำเป็น').min(0).max(5),
  communicationRating: yup.number().required('คะแนนการสื่อสารเป็นสิ่งจำเป็น').min(0).max(5),
  comment: yup.string().nullable(),
  socialProvider: yup.mixed<Provider>()
  .oneOf(['LINE', 'FACEBOOK', 'GOOGLE','PHONE', 'EMAIL'])
    .default('LINE'),  
  inspectorName: yup.string().nullable(),
  inspectorImage: yup.string().nullable(),
  inspectorEmail: yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').nullable(),
  periodIndex: yup.number().nullable(),
  createdAt: yup.date().default(() => new Date()),
});

export const imageTogallery = yup.object().shape({
  selectedTags: yup.array().of(yup.string().required()).required('เลือกแท็กอย่างน้อย 1 รายการ'),
  image : yup.string().required('เลือกรูปภาพผลงานของคุณ'),

});

export const defaulatStandardSchema: yup.ObjectSchema<DefaultStandards> = yup
  .object({
    id: yup.string().required(),
    image: yup.string().required().required('*จำเป็น'),
    content: yup.string().required('*จำเป็น'),
    badStandardEffect: yup.string().nullable().default(null).required('*จำเป็น'),
    badStandardImage: yup.string().nullable().default(null).required('*จำเป็น'),
    standardShowTitle: yup.string().nullable().default(null).required('*จำเป็น'),
    companyId : yup.string().required(),
    createdAt : yup.date().required(),
  })
  .defined(); // Add .defined() to remove undefined from the schema



export const standardEmbedSchema: yup.ObjectSchema<StandardEmbed> = yup
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

export const materialSchema: yup.ObjectSchema<DefaultMaterials> = yup
  .object({
    id: yup.string().required(),
    name: yup.string().required(),
    description: yup.string().required(),
    companyId: yup.string().required(),
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
  standards: yup.array().of(standardEmbedSchema),
  materials: yup.array().of(materialSchema),
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
    standards: yup.array().of(standardEmbedSchema).default([]), // Add default value of empty array
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
  pdfUrl : yup.string().nullable().default(null),
  fixDays: yup.number().default(0).required('ระบุจำนวนวันซ่อม'),
  condition: yup.string().required('ระบุเงื่อนไขการรับประกัน'),
  dateWaranty: yup.date().nullable().default(null),
  endWaranty: yup.date().nullable().default(null),
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
    warrantyStatus : yup.string().required().oneOf(Object.values(WarrantyStatus)).default(WarrantyStatus.PENDING),
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

export const submissionValidationSchema: yup.ObjectSchema<Submissions> = yup.object().shape({
  
  id: yup.string().required('ระบุ ID'),
  address: yup.string().required('ระบุที่อยู่'),
  dateOffer: yup.date().required('ระบุวันที่เสนอราคา'),
  customer: customerSchemas.required(),
  customerSign : customerSignSchema,
  inspector: inspectorValidationSchema.nullable().default(null),
  services: yup
    .array()
    .of(serviceValidationSchema)
    .required('เลือกงานที่ต้องการส่ง'),
  workStatus: yup
    .string()
    .required('ระบุสถานะงาน')
    .oneOf(Object.values(WorkStatus)),
    reSubmissionId: yup.string().nullable().default(null),
    history: yup.boolean().nullable().default(false),

  description: yup.string().required('ระบุรายละเอียดงาน'),
  beforeImages: yup
    .array()
    .of(yup.string().required('ภาพก่อนทำงานแต่ละภาพเป็นสิ่งจำเป็น'))
    .required('ระบุภาพก่อนทำงาน'),
  afterImages: yup
    .array()
    .of(yup.string().required('ภาพหลังทำงานแต่ละภาพเป็นสิ่งจำเป็น'))
    .required('ระบุภาพหลังทำงาน'),
    reject: rejectValidationSchema.nullable().default(null),
    
    FCMToken: yup.string().nullable().default(null),
  workers: yup.array().of(workerSchema).required(),
  status: yup
    .string()
    .required('ระบุสถานะการอนุมัติ')
    .oneOf(Object.values(SubmissionStatus))
    .default(SubmissionStatus.PENDING),
    reviews: yup
    .array()
    .of(reviewValidationSchema)
    .required('ระบุความคิดเห็น'),
  companyName: yup.string().required('ระบุชื่อบริษัท'),
  companyCode: yup.string().required('ระบุรหัสบริษัท'),
  quotationRefNumber: yup.string().required('ระบุหมายเลขใบเสนอราคา'),
  createdAt: yup.date().default(() => new Date()),
  updatedAt: yup.date().default(() => new Date()),
  companyId: yup.string().required('ระบุรหัสบริษัท'),
  company: yup.object().nullable().default(null),
});

export const signupMobilevalidationSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required('ระบุหมายเลขโทรศัพท์')
    .min(10, 'หมายเลขโทรศัพท์อย่างน้อย 10 หลัก')
    .max(10, 'หมายเลขโทรศัพท์ไม่เกิน 10 หลัก'),
});
