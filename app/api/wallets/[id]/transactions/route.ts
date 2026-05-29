import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Wallet } from "@/lib/models/wallet";
import { WalletTransaction } from "@/lib/models/walletTransaction";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = readSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid wallet id" }, { status: 400 });
  }

  await connectToDatabase();

  const wallet = await Wallet.findById(id).lean();

  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  if (session.role !== "admin" && String(wallet.userId) !== session.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const transactions = await WalletTransaction.find({ walletId: wallet._id }).sort({ createdAt: -1 }).limit(100).lean();

  return NextResponse.json({ transactions });
}