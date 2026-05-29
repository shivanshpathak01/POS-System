import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  await connectToDatabase();

  const order = await Order.findById(id);

  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  order.paymentStatus = "failed";
  order.paymentMethod = "qr";
  order.paymentReference = "";
  order.status = "cancelled";

  await order.save();

  return NextResponse.json({ message: "Payment failed", order });
}
