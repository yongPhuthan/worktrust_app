import * as yup from 'yup';
import { UserRole } from '../../types/enums';

  const userRoleEnum = Object.values(UserRole);
export const userSchema = yup
  .object()
  .shape({
    name: yup.string().required('กรุณากรอกชื่อ'),
    email: yup.string().email('รูปแบบไม่ถูกต้อง').nullable().optional(),
    jobPosition: yup.string().required('กรุณากรอกตำแหน่งงาน'),
    provider: yup.string().required('ระบุ provider'),
    phoneNumber: yup.string().optional().nullable(),
    currentCompanyId : yup.string().required('ระบุ id บริษัท'),
    uid : yup.string().required('ระบุ uid'),
    image: yup.string().nullable(),
    companyIds: yup.array().of(yup.string()).required('ระบุ id บริษัท'),
    role: yup.mixed().oneOf(userRoleEnum).required('กรุณาเลือกบทบาท'),
    signature : yup.string().nullable(),
    subscription : yup.array().of(yup.string()).nullable(),
  })
  .strict();

export type UserType = yup.InferType<typeof userSchema>;