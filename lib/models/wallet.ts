import { Schema, model, models, Types } from "mongoose";

const walletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    credits: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type WalletRecord = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  credits: number;
  currency: string;
  isActive: boolean;
};

export const Wallet = models.Wallet ?? model("Wallet", walletSchema);