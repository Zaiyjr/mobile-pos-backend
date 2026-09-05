export interface Product {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  brandId: string;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  images?: { id: string; productId: string; imageUrl: string; isMain: boolean }[];
  variants?: { id: string; productId: string; color: string; sku: string; price: string; stockQuantity: number; _count?: { stockItems: number } }[];
  specs?: { id: string; productId: string; attributeId: string; value: string; attribute?: { id: string; name: string } }[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
