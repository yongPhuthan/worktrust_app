import {Provider, UserRole} from '@prisma/client';
import * as yup from 'yup';
import firestore,{FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

const providerEnum = Object.values(Provider);
const userRoleEnum = Object.values(UserRole);
export const UserCreateCompanySchema = yup.object().shape({
  name: yup.string().required('กรุณากรอกชื่อ'),
  uid : yup.string().nullable().optional(),
  jobPosition: yup.string().required('กรุณากรอกตำแหน่งงาน'),
  phoneNumber: yup.string().optional().nullable(),
  // role: yup.mixed().oneOf(userRoleEnum).required('กรุณาเลือกบทบาท'),
}).strict();



export const CompanyCreateSchema = yup.object().shape({
  id : yup.string().nullable().optional(),
  code: yup.string().required('กรุณากรอกรหัสบริษัท'),
  bizName: yup.string().required('กรุณากรอกชื่อบริษัท'),
  address: yup.string().required('กรุณากรอกที่อยู่'),
  userUids : yup.array().of(yup.string()).required('กรุณาเลือกผู้ใช้งาน'),
  officeTel: yup
    .string()
    // .min(6, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')
    // .max(10, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  mobileTel: yup
    .string()
    // .min(10, 'กรุณากรอกเบอร์โทรศัพท์มือถือให้ถูกต้อง')
    // .max(10, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  companyTax: yup
    .string()
    // .min(10, 'กรุณากรอกเลขประจำตัวผู้เสียภาษีให้ถูกต้อง')
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  bizType: yup.string().required('กรุณาเลือกประเภทธุรกิจ'),
  logo: yup.string().optional().nullable().transform((value) => (value === '' ? null : value)),
}).strict();



// combind schema and type
export type UserCreateCompanySchemaType = yup.InferType<typeof UserCreateCompanySchema>;
export type CompanyCreateSchemaType = yup.InferType<typeof CompanyCreateSchema>;

// combind validation schema
export const CreateCompanyValidationSchema = yup.object().shape({
  seller: UserCreateCompanySchema,
  company: CompanyCreateSchema,
});

export const PostCreateCompanyValidationSchema = yup.object().shape({
  seller: UserCreateCompanySchema,
  company: CompanyCreateSchema,
  token: yup.string().required('พบปัญหาในการสร้างบัญชีผู้ใช้ กรุณาลองใหม่อีกครั้ง (token)'),
}).strict();

// combind validation schema type
export type CreateCompanyValidationSchemaType = yup.InferType<typeof CreateCompanyValidationSchema>;
export type PostCreateCompanyValidationSchemaType = yup.InferType<typeof PostCreateCompanyValidationSchema>;