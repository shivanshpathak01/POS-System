import { NextRequest, NextResponse } from "next/server";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { Product } from "@/lib/models/product";
import { productSchema } from "@/lib/schemas";

export async function GET() {
  await connectToDatabase();
  const products = await Product.find().sort({ createdAt: -1 }).populate("categoryId", "name slug").lean();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const session = readSessionFromRequest(request);

  if (!session || session.role === "customer") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = productSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid product data", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const category = await Category.findById(parsedBody.data.categoryId);

  if (!category) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  const product = await Product.create(parsedBody.data);

  return NextResponse.json({ product }, { status: 201 });
}