import { z } from "zod";

const identifier = z.union([z.string().min(1), z.number().int()]);
const productImageSchema = z.object({
  imageUrl: z.string().url(),
  isMain: z.boolean().optional(),
}).passthrough();
const productVariantSchema = z.object({
  color: z.string().min(1),
  sku: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  stockQuantity: z.coerce.number().int().nonnegative(),
}).passthrough();

export const authRegisterSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1),
  name: z.string().min(1),
  roleId: identifier.optional(),
  tenantId: z.string().optional(),
}).passthrough()
  .refine((value) => Boolean(value.email ?? value.username), "email or username is required")
  .transform((value) => ({ ...value, email: value.email ?? value.username }));

export const authLoginSchema = z.object({
  email: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1),
}).passthrough().refine((value) => Boolean(value.email ?? value.username), "email or username is required")
  .transform((value) => ({ ...value, email: value.email ?? value.username }));

export const categorySchema = z.object({ name: z.string().min(1) }).passthrough();
export const brandSchema = z.object({ name: z.string().min(1) }).passthrough();
export const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  points: z.coerce.number().int().nonnegative().optional(),
}).passthrough();
export const pointsSchema = z.object({ points: z.coerce.number().int() }).passthrough();
export const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: identifier,
  brandId: identifier,
  images: z.object({ create: z.array(productImageSchema).optional() }).passthrough().optional(),
  variants: z.object({ create: z.array(productVariantSchema).optional() }).passthrough().optional(),
}).passthrough();
export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
}).passthrough();
export const stockCreateSchema = z.object({
  variantId: identifier,
  serialNumber: z.string().min(1),
  status: z.string().optional(),
}).passthrough();
export const stockStatusSchema = z.object({ status: z.string().min(1) }).passthrough();
export const orderCheckoutSchema = z.object({
  employeeId: identifier.optional(),
  customerId: identifier.nullable().optional(),
  totalAmount: z.coerce.number().nonnegative(),
  items: z.array(z.object({
    variantId: identifier,
    quantity: z.coerce.number().int().positive(),
    priceAtTime: z.coerce.number().nonnegative(),
    stockItemIds: z.array(identifier).default([]),
  }).passthrough()).min(1),
}).passthrough();
export const roleSchema = z.object({ name: z.string().min(1) }).passthrough();
export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
}).passthrough();
