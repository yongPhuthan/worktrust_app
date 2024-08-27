import { QuotationStatus } from '../../../types/enums';
import * as Yup from 'yup';

const quotationEventsSchema = Yup.object().shape({
  
  pageView: Yup.number().default(0),
  download: Yup.number().default(0),
  print: Yup.number().default(0),
  share: Yup.number().default(0),
  customerName: Yup.string().required("ไม่พบชื่อลูกค้า"),
  allTotal : Yup.number().required("ไม่พบยอดรวม"),
  dateOffer : Yup.date().required("ไม่พบวันที่เสนอราคา"),
  dateEnd : Yup.date().required("ไม่พบวันที่สิ้นสุด"),
  quotationId : Yup.string().required("กรุณากรอก quotationId"),
  createdAt: Yup.date().default( new Date()),
  lastOccurredAt: Yup.date().default( new Date()),
  status: Yup
  .string()
  .required()
  .oneOf(Object.values(QuotationStatus))
  .default(QuotationStatus.PENDING),
});

type QuotationEventsType = Yup.InferType<typeof quotationEventsSchema>;

export { QuotationEventsType, quotationEventsSchema  };