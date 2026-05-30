import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname: host, port });
const handle = app.getRequestHandler();

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const idx = entry.indexOf("=");
      if (idx === -1) return acc;
      const key = entry.slice(0, idx);
      const value = entry.slice(idx + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function readSessionFromSocket(socket) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const cookies = parseCookies(socket.handshake.headers.cookie);
  const token = cookies.mitra_token;
  if (!token) return null;

  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: true,
      credentials: true,
    },
  });

  globalThis.__io = io;

  io.on("connection", (socket) => {
    const session = readSessionFromSocket(socket);

    socket.on("order:subscribe", (orderId) => {
      if (typeof orderId === "string" && orderId.trim()) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on("order:unsubscribe", (orderId) => {
      if (typeof orderId === "string" && orderId.trim()) {
        socket.leave(`order:${orderId}`);
      }
    });

    socket.on("kitchen:subscribe", () => {
      if (!session || (session.role !== "admin" && session.role !== "staff")) {
        socket.emit("kitchen:unauthorized", { message: "Unauthorized" });
        return;
      }

      socket.join("kitchen");
    });

    socket.on("kitchen:unsubscribe", () => {
      socket.leave("kitchen");
    });
  });

  httpServer.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://${host}:${port}`);
  });
});
