import * as yup from 'yup';

export const LoginMobileSchema = yup.object().shape({
    phoneNumber: yup
    .string()
    .required('ระบุหมายเลขโทรศัพท์')
    .min(10, 'หมายเลขโทรศัพท์อย่างน้อย 10 หลัก')
    .max(10, 'หมายเลขโทรศัพท์ไม่เกิน 10 หลัก'),
})

export const PostMobileSchema = yup.object().shape({
    phoneNumber: yup
    .string()
    .required('ระบุหมายเลขโทรศัพท์')
    .min(10, 'หมายเลขโทรศัพท์อย่างน้อย 10 หลัก')
    .max(10, 'หมายเลขโทรศัพท์ไม่เกิน 10 หลัก'),
    //firebase uid 
    firebaseUid: yup.string().required('พบปัญหาในการสร้างบัญชีผู้ใช้ กรุณาลองใหม่อีกครั้ง (uid)'),
}).strict();



//  type 
export type LoginMobileSchemaType = yup.InferType<typeof LoginMobileSchema>;
export type PostMobileSchemaType = yup.InferType<typeof PostMobileSchema>;
