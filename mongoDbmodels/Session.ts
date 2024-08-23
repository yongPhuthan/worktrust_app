import { Document, Types, Schema, model } from 'mongoose';

export interface ISession extends Document {
  sessionToken: string;
  userId: Types.ObjectId;
  expires: Date;
}

const sessionSchema = new Schema<ISession>({
  sessionToken: { type: String, unique: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expires: { type: Date, required: true },
}, {
  collection: 'sessions'
});

const Session = model<ISession>('Session', sessionSchema);

export default Session;