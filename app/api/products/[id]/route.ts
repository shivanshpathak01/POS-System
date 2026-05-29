import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { Product } from "@/lib/models/product";
import { productSchema } from "@/lib/schemas";

function isAuthorized(request: NextRequest) {
  const session = readSessionFromRequest(request);
  return Boolean(session && session.role !== "customer");
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const parsedBody = productSchema.partial().safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid product data", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  if (parsedBody.data.categoryId) {
    await connectToDatabase();
    const category = await Category.findById(parsedBody.data.categoryId);

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
  }

  await connectToDatabase();
  const product = await Product.findByIdAndUpdate(id, parsedBody.data, { new: true });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  await connectToDatabase();
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Product deleted" });
}