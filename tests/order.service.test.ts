import assert from "node:assert/strict";
import { test } from "node:test";
import type { CreateOrderDTO, Order } from "../src/modules/order/domain/entities.js";
import type { OrderRepositoryPort } from "../src/modules/order/domain/ports.js";
import { OrderService } from "../src/modules/order/application/order.service.js";

const input: CreateOrderDTO = {
  employeeId: "employee-1",
  totalAmount: 1200,
  items: [{ variantId: "variant-1", quantity: 1, priceAtTime: 1200, stockItemIds: ["stock-1"] }],
};

test("OrderService forwards a valid checkout to its repository port", async () => {
  let received: CreateOrderDTO | undefined;
  const order: Order = {
    id: "order-1",
    employeeId: input.employeeId,
    totalAmount: "1200",
    status: "PAID",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
  const repository: OrderRepositoryPort = {
    create: async (data) => { received = data; return order; },
    findAll: async () => [order],
    findById: async () => order,
    cancel: async () => order,
  };

  assert.equal(await new OrderService(repository).checkout(input), order);
  assert.deepEqual(received, input);
});

test("OrderService rejects an empty cart before reaching the repository", async () => {
  let createCalled = false;
  const repository: OrderRepositoryPort = {
    create: async () => { createCalled = true; throw new Error("must not call repository"); },
    findAll: async () => [],
    findById: async () => null,
    cancel: async () => null,
  };

  await assert.rejects(() => new OrderService(repository).checkout({ ...input, items: [] }), { statusCode: 400 });
  assert.equal(createCalled, false);
});
