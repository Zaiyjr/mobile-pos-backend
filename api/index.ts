import "dotenv/config";
import express from "express";
import { createApp } from "../src/shared/presentation/http/app.js";

// Vercel serverless entrypoint — must directly import express so Vercel detects it
const app = createApp();
export default app;
