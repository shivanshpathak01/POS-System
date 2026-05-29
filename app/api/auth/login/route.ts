import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const parsedBody = loginSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json({ message: "Invalid login data", issues: parsedBody.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: parsedBody.data.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(parsedBody.data.password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const token = createToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("mitra_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log in";
    return NextResponse.json(
      {
        message: process.env.NODE_ENV === "production" ? "Unable to log in" : message,
      },
      { status: 500 }
    );
  }
}