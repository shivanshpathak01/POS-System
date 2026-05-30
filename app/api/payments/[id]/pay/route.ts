import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { emitOrderRealtime } from "@/lib/realtime";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  await connectToDatabase();

  const order = await Order.findById(id);

  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  // mark as paid
  order.paymentStatus = "paid";
  order.paymentMethod = "qr";
  order.paymentReference = randomBytes(8).toString("hex");
  order.status = "preparing";

  await order.save();

  emitOrderRealtime(order);

  return NextResponse.json({ message: "Payment recorded", order });
}
