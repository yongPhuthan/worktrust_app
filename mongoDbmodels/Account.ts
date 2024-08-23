import { Schema, model, Document, Types } from 'mongoose';
import { SocialProvider } from '../types/enums';

interface IAccount  {
  userId: Types.ObjectId;
  provider: SocialProvider;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  oauth_token_secret?: string;
  oauth_token?: string;
}

const accountSchema = new Schema<IAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: {
    type: String,
    enum: Object.values(SocialProvider),
  },
  providerAccountId: { type: String, required: true },
  refresh_token: { type: String },
  access_token: { type: String },
  expires_at: { type: Number },
  token_type: { type: String },
  scope: { type: String },
  id_token: { type: String },
  session_state: { type: String },
  oauth_token_secret: { type: String },
  oauth_token: { type: String },
});

const Account = model<IAccount>('Account', accountSchema);

export default Account;