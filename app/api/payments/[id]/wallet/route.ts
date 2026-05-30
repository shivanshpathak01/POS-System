import { NextRequest, NextResponse } from "next/server";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { emitOrderRealtime } from "@/lib/realtime";
import { Wallet } from "@/lib/models/wallet";
import { WalletTransaction } from "@/lib/models/walletTransaction";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = readSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await connectToDatabase();

  const order = await Order.findById(id);

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const wallet = await Wallet.findOne({ userId: session.userId });

  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  if (wallet.balance < order.totalAmount) {
    return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 });
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - order.totalAmount;

  wallet.balance = balanceAfter;
  wallet.credits = Math.max(wallet.credits - order.totalAmount, 0);
  await wallet.save();

  const transaction = await WalletTransaction.create({
    walletId: wallet._id,
    userId: wallet.userId,
    type: "wallet_spend",
    amount: order.totalAmount,
    credits: order.totalAmount,
    balanceBefore,
    balanceAfter,
    reference: `ORDER-${order.orderNumber}`,
    note: "Order payment using wallet balance",
    metadata: { orderId: order._id },
  });

  order.paymentStatus = "paid";
  order.paymentMethod = "token";
  order.paymentReference = String(transaction._id);
  order.status = "preparing";

  await order.save();

  emitOrderRealtime(order);

  return NextResponse.json({ message: "Wallet payment recorded", order, wallet, transaction });
}