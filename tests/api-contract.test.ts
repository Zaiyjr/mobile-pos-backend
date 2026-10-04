import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { createApp } from "../src/shared/presentation/http/app.js";

const server = createApp().listen(0);
let baseUrl = "";

before(async () => {
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  server.close();
  await once(server, "close");
});

test("versioned API rejects invalid login bodies with the documented error envelope", async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "", password: "" }),
  });
  const body = await response.json() as { success: boolean; status: number; message: string };

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.status, 400);
  assert.match(body.message, /password|email|username/);
});

test("legacy root API prefix continues to accept the same route contract", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "cashier", password: "" }),
  });
  assert.equal(response.status, 400);
});
