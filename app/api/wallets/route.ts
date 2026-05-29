import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user";
import { Wallet } from "@/lib/models/wallet";
import { walletCreateSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const session = readSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const wallet = await Wallet.findOne({ userId: session.userId }).populate("userId", "name email role").lean();

  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  return NextResponse.json({ wallet });
}

export async function POST(request: NextRequest) {
  const session = readSessionFromRequest(request);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = walletCreateSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid wallet data", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  const { userId, initialBalance } = parsedBody.data;

  if (!isValidObjectId(userId)) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findById(userId);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const existingWallet = await Wallet.findOne({ userId: user._id });

  if (existingWallet) {
    return NextResponse.json({ message: "Wallet already exists", wallet: existingWallet }, { status: 409 });
  }

  const wallet = await Wallet.create({
    userId: user._id,
    balance: initialBalance,
    credits: initialBalance,
    currency: "INR",
    isActive: true,
  });

  return NextResponse.json({ wallet }, { status: 201 });
}