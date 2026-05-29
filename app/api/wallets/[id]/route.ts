import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Wallet } from "@/lib/models/wallet";

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

  const wallet = await Wallet.findById(id).populate("userId", "name email role").lean();

  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  if (session.role !== "admin" && String(wallet.userId?._id ?? wallet.userId) !== session.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ wallet });
}