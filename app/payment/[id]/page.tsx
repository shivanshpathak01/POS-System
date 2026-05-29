import PaymentClient from "./PaymentClient";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";

export default async function Page({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await params as { id: string };

  await connectToDatabase();
  const order = await Order.findById(id).lean();

  // Convert Mongoose objects (ObjectId, Dates) into plain JSON-friendly values
  let initialOrder = null;
  if (order) {
    initialOrder = {
      ...order,
      _id: String(order._id),
      createdBy: order.createdBy ? String(order.createdBy) : undefined,
      createdAt: order.createdAt ? order.createdAt.toISOString() : undefined,
      updatedAt: order.updatedAt ? order.updatedAt.toISOString() : undefined,
      items: Array.isArray(order.items)
        ? order.items.map((it: any) => ({
            ...it,
            productId: it.productId ? String(it.productId) : undefined,
          }))
        : [],
    };
  }

  return <PaymentClient orderId={id} initialOrder={initialOrder} />;
}
