import * as Yup from 'yup';

import { userSchema } from './users';
import { workerSchema } from './subcollection/workers';
import { imagesSchema } from '../field/embed/images';

const companySchema = Yup.object().shape({
  id : Yup.string().required("กรุณากรอกไอดีบริษัท"),
  bizName: Yup.string().required("กรุณากรอกชื่อบริษัท"),
  code : Yup.string().required("กรุณากรอกรหัสบริษัท"),
  address: Yup.string().required("กรุณากรอกที่อยู่"),
  officeTel: Yup.string().nullable(),
  mobileTel: Yup.string().nullable(),
  companyTax: Yup.string().nullable(),
  bizType: Yup.string().required("กรุณากรอกประเภทธุรกิจ"),
  logo: imagesSchema.nullable().default(null),
  isActive: Yup.boolean().default(true),
  userUids: Yup.array().of(Yup.string()).min(1).required("กรุณาเลือกผู้ใช้งาน"),
  warranty: Yup.object().shape({
    skillWarrantyMonth: Yup.number().default(0),
    productWarrantyMonth: Yup.number().required("กรุณากรอกเดือนรับประกันสินค้า"),
    fixDays: Yup.number().default(0),
    dateWarranty: Yup.date().nullable(),
    endSkillWarranty: Yup.date().nullable(),
    endProductWarranty: Yup.date().nullable(),
    condition: Yup.string().required("กรุณากรอกเงื่อนไขการรับประกันสินค้า"),
    pdfUrl: Yup.string().nullable(),
    sellerSignature: Yup.string().nullable(),
  }).nullable(),
  submissions: Yup.array().of(Yup.string()).nullable(),
  notifications: Yup.array().of(Yup.string()).nullable(),
});
// company omit workers , standards , materials, submissions, notifications
const craeteCompanySchema = companySchema.omit(
  [ "submissions", ]
)

const createCompanyAndUpdateSellerSchema = Yup.object().shape({
  company: craeteCompanySchema.required(),
  seller: userSchema.required(),
});

type CompanyType = Yup.InferType<typeof companySchema>;
type CreateCompanyAndUpdateSellerType = Yup.InferType<typeof createCompanyAndUpdateSellerSchema>;


export { companySchema,CompanyType, createCompanyAndUpdateSellerSchema, CreateCompanyAndUpdateSellerType };
