import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user";
import { Category } from "@/lib/models/category";
import { Product } from "@/lib/models/product";
import bcrypt from "bcryptjs";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Seeding disabled in production" }, { status: 403 });
  }

  await connectToDatabase();

  // create admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.test";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "adminpass", 10);
    await User.create({ name: "Admin", email: adminEmail, passwordHash: hash, role: "admin" });
  }

  // create staff
  const staffEmail = process.env.SEED_STAFF_EMAIL ?? "staff@local.test";
  const existingStaff = await User.findOne({ email: staffEmail });
  if (!existingStaff) {
    const hash = await bcrypt.hash(process.env.SEED_STAFF_PASSWORD ?? "staffpass", 10);
    await User.create({ name: "Staff", email: staffEmail, passwordHash: hash, role: "staff" });
  }

  // categories
  const categories = [
    { name: "Beverages", slug: "beverages", description: "Drinks and refreshments" },
    { name: "Main", slug: "main", description: "Main courses" },
  ];

  const createdCategories: any[] = [];
  for (const c of categories) {
    let cat = await Category.findOne({ slug: c.slug });
    if (!cat) cat = await Category.create(c);
    createdCategories.push(cat);
  }

  // sample products
  const sampleProducts = [
    { name: "Espresso", price: 70, categorySlug: "beverages", stock: 50 },
    { name: "Cappuccino", price: 120, categorySlug: "beverages", stock: 40 },
    { name: "Margherita Pizza", price: 450, categorySlug: "main", stock: 10 },
  ];

  for (const p of sampleProducts) {
    const cat = createdCategories.find((x) => x.slug === p.categorySlug);
    if (!cat) continue;
    const existing = await Product.findOne({ name: p.name });
    if (!existing) {
      await Product.create({ name: p.name, price: p.price, categoryId: String(cat._id), stock: p.stock });
    }
  }

  return NextResponse.json({ message: "Seed completed" });
}
