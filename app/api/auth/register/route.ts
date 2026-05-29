import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user";
import { Wallet } from "@/lib/models/wallet";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const parsedBody = registerSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json({ message: "Invalid registration data", issues: parsedBody.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: parsedBody.data.email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsedBody.data.password, 10);
    const user = await User.create({
      name: parsedBody.data.name,
      email: parsedBody.data.email.toLowerCase(),
      passwordHash,
      role: "customer",
    });

    await Wallet.create({
      userId: user._id,
      balance: 0,
      credits: 0,
      currency: "INR",
      isActive: true,
    });

    const token = createToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: "Customer registered",
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("mitra_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register user";
    return NextResponse.json(
      {
        message: process.env.NODE_ENV === "production" ? "Unable to register user" : message,
      },
      { status: 500 }
    );
  }
}