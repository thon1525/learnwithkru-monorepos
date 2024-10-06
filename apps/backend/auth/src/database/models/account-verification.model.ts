import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAccountVerificationDocument extends Document {
  authId: mongoose.Types.ObjectId;
  emailVerificationToken: string;
  createdAt: Date;
  expiredAt: Date;
}

export interface IAccountVerificationModel
  extends Model<IAccountVerificationDocument> {}

const accountVerificationSchema = new Schema<IAccountVerificationDocument>({
  authId: { type: Schema.Types.ObjectId, required: true }, // Added index for faster queries
  emailVerificationToken: { type: String, required: true }, // Added index for faster queries
  createdAt: { type: Date, default: Date.now },
  expiredAt: {
    type: Date,
    required: true,
    validate: {
      validator: function (value: Date) {
        return value > (this as IAccountVerificationDocument).createdAt;
      },
      message: 'Expiration date must be greater than creation date.',
    },
  },
});

const AccountVerificationModel = mongoose.model<
  IAccountVerificationDocument,
  IAccountVerificationModel
>('AccountVerification', accountVerificationSchema);

export default AccountVerificationModel;
