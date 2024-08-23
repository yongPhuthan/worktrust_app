import { Schema, model, Document, Types } from "mongoose";
import {
  IServiceEmbed,
  serviceEmbedSchema,
} from "../types/interfaces/ServicesEmbed";
import {
  customerEmbedSchema,
  ICustomerEmbed,
} from "../types/interfaces/CustomerEmbed";
import {
  IWorkerEmbed,
  workerEmbedSchema,
} from "../types/interfaces/WorkerEmbed";
import {
  IInspectorEmbed,
  inspectorEmbedSchema,
} from "../types/interfaces/InspectorEmbed";
import {
  IReviewsEmbed,
  reviewsEmbedSchema,
} from "../types/interfaces/ReviewsEmbed";
import {
  ISubmissionImagesPairEmbed,
  SubmissionImagesPairEmbedSchema,
} from "../types/interfaces/ImagesPairEmbed";
import {
  IRejectEmbed,
  rejectEmbedSchema,
} from "../types/interfaces/RejectEmbed";
import { SubmissionStatus } from "../types/enums";
export interface ISubmissions extends Document {
  address: string;
  dateOffer: Date;
  services: IServiceEmbed[];
  workStatus: string;
  description: string;
  reject?: IRejectEmbed;
  FCMToken?: string;
  imagesPair: ISubmissionImagesPairEmbed[];
  workers: IWorkerEmbed[];
  customer: ICustomerEmbed;
  inspector?: IInspectorEmbed;
  status: SubmissionStatus;
  reviews: IReviewsEmbed[];
  companyName: string;
  companyCode: string;
  quotationRefNumber: string;
  reSubmissionId?: string;
  history?: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: Types.ObjectId;
}

const submissionsSchema = new Schema<ISubmissions>({
  address: { type: String, required: true },
  dateOffer: { type: Date, required: true },
  services: {
    type: [serviceEmbedSchema],
    required: true,
  },
  workStatus: { type: String, required: true },
  description: { type: String, required: true },
  reject: { type: rejectEmbedSchema },
  FCMToken: { type: String, required: true },
  imagesPair: {
    type: [SubmissionImagesPairEmbedSchema],
    required: true,
  },
  workers: [workerEmbedSchema],
  customer: { type: customerEmbedSchema, required: true },
  inspector: { type: inspectorEmbedSchema },
  status: {
    type: String,
    enum: Object.values(SubmissionStatus),
    default: SubmissionStatus.PENDING,
  },  
  reviews: [reviewsEmbedSchema],
  companyName: { type: String, required: true },
  companyCode: { type: String, required: true },
  quotationRefNumber: { type: String, required: true },
  reSubmissionId: { type: String },
  history: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
});

const Submissions = model<ISubmissions>("Submissions", submissionsSchema);

export default Submissions;
