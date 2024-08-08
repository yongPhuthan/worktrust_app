import { Schema } from "mongoose";

interface IQuotationDeposit {
  firstDeposit: number;
  finalDeposit: number;
}

const quotationDeposit = new Schema<IQuotationDeposit>({
  firstDeposit: {
    type: Number,
  },
  finalDeposit: {
    type: Number,
  },
});

export { quotationDeposit, IQuotationDeposit };
