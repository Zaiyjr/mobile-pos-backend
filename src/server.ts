import 'dotenv/config';
import { createApp } from "./shared/presentation/http/app.js";
import { env } from "./shared/config/env.js";

const app = createApp();
const PORT = process.env.PORT || 5000;

// 4. Start Server — listen on Render/local, not on Vercel serverless (VERCEL=1)
if (!process.env.VERCEL) {
    // Fail fast on missing secrets for long-running deploys (Render/local).
    env.assertRequired();
    app.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
    });
}

// 🔥 ສິ່ງສຳຄັນທີ່ສຸດ: ຕ້ອງມີການ Export app ອອກມາໃຫ້ Vercel ເອົາໄປໃຊ້ງານ
export default app;
