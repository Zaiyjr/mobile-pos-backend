export interface Product {
  id: number;
  name: string;
  description?: string | null;
  categoryId: number;
  brandId: number;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
  images?: { id: number; productId: number; imageUrl: string; isMain: boolean }[];
  variants?: { id: number; productId: number; color: string; sku: string; price: string; stockQuantity: number; _count?: { stockItems: number } }[];
  specs?: { id: number; productId: number; attributeId: number; value: string; attribute?: { id: number; name: string } }[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
