import * as yup from 'yup';

export const RegisterEmailSchema = yup.object().shape({
    email: yup
    .string()
    .email('รูปแบบอีเมลล์ยังไม่ถูกต้อง')
    .required('กรุณากรอกอีเมลล์'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), ''], 'รหัสผ่านไม่ตรงกัน')
    .required('ยืนยันรหัสผ่าน'),
}).strict();

export const PostRegisterEmailSchema = yup.object().shape({
  email: yup
  .string()
  .email('รูปแบบอีเมลล์ยังไม่ถูกต้อง')
  .required('กรุณากรอกอีเมลล์'),
  //firebase uid 
  firebaseUid: yup.string().required('พบปัญหาในการสร้างบัญชีผู้ใช้ กรุณาลองใหม่อีกครั้ง (uid)'),
}).strict();



//  schema and type 
export type RegisterEmailSchemaType = yup.InferType<typeof RegisterEmailSchema>;
export type PostRegisterEmailSchemaType = yup.InferType<typeof PostRegisterEmailSchema>;
