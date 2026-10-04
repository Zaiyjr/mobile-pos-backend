import assert from "node:assert/strict";
import { test } from "node:test";
import type { Product } from "../src/modules/product/domain/entities.js";
import type { ProductRepositoryPort } from "../src/modules/product/domain/ports.js";
import { ProductService } from "../src/modules/product/application/product.service.js";

const product: Product = {
  id: "product-1",
  name: "iPhone",
  categoryId: "category-1",
  brandId: "brand-1",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  isDeleted: false,
};

test("ProductService returns the product found by its repository port", async () => {
  const repository: ProductRepositoryPort = {
    create: async () => product,
    findAll: async () => [product],
    findById: async (id) => id === product.id ? product : null,
    update: async () => product,
    softDelete: async () => product,
  };

  assert.equal(await new ProductService(repository).getById("product-1"), product);
});

test("ProductService translates a missing product into NotFoundError", async () => {
  const repository: ProductRepositoryPort = {
    create: async () => product,
    findAll: async () => [],
    findById: async () => null,
    update: async () => null,
    softDelete: async () => null,
  };

  await assert.rejects(() => new ProductService(repository).getById("missing"), { statusCode: 404 });
});
