import { NextRequest, NextResponse } from "next/server";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { User } from "@/lib/models/user";
import { emitKitchenRealtime, emitOrderRealtime } from "@/lib/realtime";
import { orderSchema } from "@/lib/schemas";

function buildOrderNumber() {
  return `ORD-${Date.now()}`;
}

export async function GET(request: NextRequest) {
  const session = readSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const canViewAllOrders = session.role === "admin" || session.role === "staff";

  const orders = canViewAllOrders
    ? await Order.find().sort({ createdAt: -1 }).limit(50).populate("createdBy", "name email role").lean()
    : await Order.find({ createdBy: session.userId }).sort({ createdAt: -1 }).limit(50).lean();

  const normalizedOrders = orders.map((order) => ({
    ...order,
    createdBy: order.createdBy
      ? {
          _id: String((order.createdBy as any)._id ?? order.createdBy),
          name: (order.createdBy as any).name,
          email: (order.createdBy as any).email,
          role: (order.createdBy as any).role,
        }
      : null,
  }));

  return NextResponse.json({ orders: normalizedOrders });
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

  emitKitchenRealtime("order:created", { orderId: String(order._id), order });
  emitOrderRealtime(order);

  return NextResponse.json({ order }, { status: 201 });
}