import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { emitOrderRealtime } from "@/lib/realtime";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = readSessionFromRequest(request);

  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  const body = await request.json();
  const { status } = body as { status?: string };

  const allowed = ["pending", "preparing", "completed", "cancelled"];

  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  await connectToDatabase();

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  emitOrderRealtime(order);

  return NextResponse.json({ order });
}
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  await connectToDatabase();
  const order = await Order.findById(id).lean();

  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  return NextResponse.json({ order });
}
