import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Wallet } from "@/lib/models/wallet";
import { WalletTransaction } from "@/lib/models/walletTransaction";
import { walletDeductSchema } from "@/lib/schemas";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = readSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid wallet id" }, { status: 400 });
  }

  const parsedBody = walletDeductSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid deduct data", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const wallet = await Wallet.findById(id);

  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  if (session.role !== "admin" && String(wallet.userId) !== session.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const amount = parsedBody.data.amount;

  if (wallet.balance < amount) {
    return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 });
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - amount;
  const creditsDeducted = Math.min(wallet.credits, amount);

  wallet.balance = balanceAfter;
  wallet.credits = Math.max(wallet.credits - creditsDeducted, 0);
  await wallet.save();

  const transaction = await WalletTransaction.create({
    walletId: wallet._id,
    userId: wallet.userId,
    type: "wallet_spend",
    amount,
    credits: creditsDeducted,
    balanceBefore,
    balanceAfter,
    reference: parsedBody.data.reference,
    note: parsedBody.data.note,
    metadata: {},
  });

  return NextResponse.json({ wallet, transaction });
}