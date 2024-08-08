// src/interfaces/VerificationToken.ts
import { Document,Schema,model } from 'mongoose';

export interface IVerificationToken extends Document {
  identifier: string;
  token: string;
  expires: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>({
    identifier: { type: String, required: true },
    token: { type: String, unique: true, required: true },
    expires: { type: Date, required: true },
  }, {
    collection: 'verification_tokens'
  });
  
  const VerificationToken = model<IVerificationToken>('VerificationToken', verificationTokenSchema);
  
  export default VerificationToken;