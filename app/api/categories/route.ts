import { NextRequest, NextResponse } from "next/server";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { categorySchema } from "@/lib/schemas";

export async function GET() {
  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const session = readSessionFromRequest(request);

  if (!session || session.role === "customer") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = categorySchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid category data", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const category = await Category.create(parsedBody.data);

  return NextResponse.json({ category }, { status: 201 });
}