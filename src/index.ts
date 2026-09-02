/**
 * Render fallback entry — Render was looking for src/index.js but entry is src/server.ts
 * This file ensures `npm start` and `node dist/server.js` both work; `src/index.js` not needed at runtime.
 */
import app from "./server.js";
export default app;
