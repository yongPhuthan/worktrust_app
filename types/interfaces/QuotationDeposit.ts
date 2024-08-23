// import { Schema } from "mongoose";

// interface IQuotationDeposit {
//   firstDeposit: number;
//   finalDeposit: number;
// }

// const quotationDeposit = new Schema<IQuotationDeposit>({
//   firstDeposit: {
//     type: Number,
//   },
//   finalDeposit: {
//     type: Number,
//   },
// });

// export { quotationDeposit, IQuotationDeposit };

// create  Yup schema for validation same as IQuotationDeposit
import * as Yup from 'yup';

const quotationDeposit = Yup.object().shape({
  firstDeposit: Yup.number().required("กรุณากรอกจำนวนเงิน"),
  finalDeposit: Yup.number().required("กรุณากรอกจำนวนเงิน"),
});

type IQuotationDeposit = Yup.InferType<typeof quotationDeposit>;

export { IQuotationDeposit, quotationDeposit };
