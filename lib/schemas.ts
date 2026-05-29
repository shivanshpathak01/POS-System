import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100),
  description: z.string().max(255).optional().default(""),
  isActive: z.boolean().optional().default(true),
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  categoryId: z.string().min(1),
  price: z.coerce.number().min(0),
  isAvailable: z.coerce.boolean().optional().default(true),
  isVeg: z.coerce.boolean().optional().default(true),
  imageUrl: z.string().url().or(z.literal("")).optional().default(""),
  stock: z.coerce.number().int().min(0).optional().default(0),
});

export const orderSchema = z.object({
  source: z.enum(["pos", "qr"]).optional().default("pos"),
  taxRate: z.coerce.number().min(0).optional().default(5),
  discountAmount: z.coerce.number().min(0).optional().default(0),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      productName: z.string().min(1),
      quantity: z.coerce.number().int().min(1),
      unitPrice: z.coerce.number().min(0),
    })
  ).min(1),
});

export const walletCreateSchema = z.object({
  userId: z.string().min(1),
  initialBalance: z.coerce.number().min(0).optional().default(0),
});

export const walletTopUpSchema = z.object({
  amount: z.coerce.number().positive(),
  creditMultiplier: z.coerce.number().positive().optional().default(1),
  reference: z.string().max(120).optional().default(""),
  note: z.string().max(255).optional().default(""),
});

export const walletDeductSchema = z.object({
  amount: z.coerce.number().positive(),
  reference: z.string().max(120).optional().default(""),
  note: z.string().max(255).optional().default(""),
});