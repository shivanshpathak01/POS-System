import { NextRequest, NextResponse } from "next/server";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { orderSchema } from "@/lib/schemas";

function buildOrderNumber() {
  return `ORD-${Date.now()}`;
}

export async function GET() {
  await connectToDatabase();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const parsedBody = orderSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid order data", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  // Allow QR orders from public users (no session). For POS orders, allow any authenticated role
  // so customers can create orders directly from the POS screen as well.
  const isQrOrder = parsedBody.data.source === "qr";
  const session = readSessionFromRequest(request);

  if (!isQrOrder) {
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  const subtotal = parsedBody.data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * parsedBody.data.taxRate) / 100;
  const totalAmount = Math.max(subtotal + taxAmount - parsedBody.data.discountAmount, 0);

  await connectToDatabase();

  const order = await Order.create({
    orderNumber: buildOrderNumber(),
    source: parsedBody.data.source,
    items: parsedBody.data.items.map((item) => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    })),
    subtotal,
    taxAmount,
    discountAmount: parsedBody.data.discountAmount,
    totalAmount,
    createdBy: isQrOrder ? undefined : session?.userId,
    paymentStatus: "pending",
    paymentMethod: "qr",
  });

  return NextResponse.json({ order }, { status: 201 });
}