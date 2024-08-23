import { Schema, model, Document, Types } from 'mongoose';
import { SocialProvider, UserRole } from '.././types/enums';

export interface IUser extends Document {

  name?: string;
  provider: SocialProvider
  email?: string;
  phoneNumber?: string;
  role: UserRole
  password?: string;
  signature?: string;
  isActive: boolean;
  jobPosition?: string;
  currentCompanyId?: Types.ObjectId;
  uid: string;
  image?: string;
  companyIds: Types.ObjectId[];
  accounts: Types.ObjectId[];
  sessions: Types.ObjectId[];
  subscriptions: Types.ObjectId[];
}

export const userSchema = new Schema<IUser>({
  name: { type: String },
  provider: {
    type: String,
    enum: Object.values(SocialProvider),
  },
  email: { type: String },
  phoneNumber: { type: String },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.OWNER,
  },
  password: { type: String },
  signature: { type: String },
  isActive: { type: Boolean, default: true },
  jobPosition: { type: String },
  currentCompanyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  uid: { type: String, unique: true, required: true },
  image: { type: String },
  companyIds: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
  accounts: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
  subscriptions: [{ type: Schema.Types.ObjectId, ref: 'Subscription' }],
});
userSchema.index({ uid: 1 });
const User = model<IUser>('User', userSchema);

export default User ;
