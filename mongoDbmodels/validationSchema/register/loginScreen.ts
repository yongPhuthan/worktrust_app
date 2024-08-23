import * as yup from 'yup';

export const LoginEmailSchema = yup.object().shape({
    email: yup
    .string()
    .email('รูปแบบอีเมลล์ไม่ถูกต้อง')
    .required('กรุณากรอกอีเมลล์'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน'),
}).strict();



// combind schema and type 
export type LoginEmailSchemaType = yup.InferType<typeof LoginEmailSchema>;

