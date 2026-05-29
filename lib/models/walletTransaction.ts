import { Schema, model, models, Types } from "mongoose";

const walletTransactionSchema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["credit_add", "credit_deduct", "cashback", "wallet_topup", "wallet_spend"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    credits: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type WalletTransactionRecord = {
  _id: Types.ObjectId;
  walletId: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  amount: number;
  credits: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  note: string;
  metadata: Record<string, unknown>;
};

export const WalletTransaction = models.WalletTransaction ?? model("WalletTransaction", walletTransactionSchema);