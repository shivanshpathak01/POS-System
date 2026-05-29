import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type SessionUser = {
  userId: string;
  email: string;
  role: "customer" | "admin" | "staff";
};

export function createToken(payload: SessionUser) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, secret) as SessionUser;
}

export function readSessionFromRequest(request: NextRequest) {
  const bearer = request.headers.get("authorization");
  const cookieToken = request.cookies.get("mitra_token")?.value;
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : cookieToken;

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
