import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { readSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { categorySchema } from "@/lib/schemas";

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
    return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
  }

  const parsedBody = categorySchema.partial().safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ message: "Invalid category data", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const category = await Category.findByIdAndUpdate(id, parsedBody.data, { new: true });

  if (!category) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ category });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
  }

  await connectToDatabase();
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Category deleted" });
}