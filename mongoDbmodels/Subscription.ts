import { Document, Types, Schema, model } from 'mongoose';
import { SubscriptionType } from '../types/enums';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: SubscriptionType;
  isActive: boolean;
}

const subscriptionSchema = new Schema<ISubscription>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    type: { 
      type: String, 
      enum: Object.values(SubscriptionType),
      required: true 
    },
    isActive: { type: Boolean, default: true },
  });
  
  const Subscription = model<ISubscription>('Subscription', subscriptionSchema);
  
  export default Subscription;