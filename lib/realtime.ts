type EventPayload = Record<string, unknown>;

function getIO() {
  return (globalThis as any).__io;
}

export function emitRealtime(event: string, payload: EventPayload) {
  const io = getIO();

  if (!io) {
    return;
  }

  io.emit(event, payload);
}

export function emitKitchenRealtime(event: string, payload: EventPayload) {
  const io = getIO();

  if (!io) {
    return;
  }

  io.to("kitchen").emit(event, payload);
}

export function emitOrderRealtime(order: { _id: string | { toString: () => string } }) {
  const io = getIO();

  if (!io) {
    return;
  }

  const orderId = typeof order._id === "string" ? order._id : order._id.toString();

  io.to("kitchen").emit("order:updated", { orderId, order });
  io.to(`order:${orderId}`).emit("payment:updated", { orderId, order });
}
