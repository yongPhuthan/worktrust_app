import * as yup from 'yup';
import { imagesSetSchema } from './material';

export const standardSchema = yup.object().shape({
    id : yup.string().nullable(),
    image: imagesSetSchema.required('กรุณาใส่รูปภาพมาตรฐาน'),
    content : yup.string().required('กรุณาใส่เนื้อหาของคุณ'),
    badStandardEffect : yup.string().nullable(),
    badStandardImage : imagesSetSchema.nullable(),
    standardShowTitle : yup.string().nullable(),
    created : yup.date().nullable(),
    updated : yup.date().nullable(),
    categories : yup.array().of(yup.string()).nullable(),
    companyId: yup.string()
        .required('กรุณาใส่รหัสบริษัทของคุณ')
        .matches(/^[0-9a-fA-F]{24}$/, 'รูปแบบไม่ถูกต้อง(objectId)'),
}).strict();    

// combind schema and type 
export type StandardSchemaType = yup.InferType<typeof standardSchema>;

