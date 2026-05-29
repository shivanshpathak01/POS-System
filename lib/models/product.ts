import { Schema, model, models, Types } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export type ProductRecord = {
  _id: Types.ObjectId;
  name: string;
  price: number;
  isAvailable: boolean;
  isVeg: boolean;
  imageUrl: string;
  stock: number;
  categoryId: Types.ObjectId;
};

export const Product = models.Product ?? model("Product", productSchema);