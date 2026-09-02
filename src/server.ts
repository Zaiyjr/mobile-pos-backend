import 'dotenv/config';
import { createApp } from "./shared/presentation/http/app.js";

const app = createApp();
const PORT = process.env.PORT || 5000;

// 4. Start Server — listen on Render/local, not on Vercel serverless (VERCEL=1)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
    });
}

// 🔥 ສິ່ງສຳຄັນທີ່ສຸດ: ຕ້ອງມີການ Export app ອອກມາໃຫ້ Vercel ເອົາໄປໃຊ້ງານ
export default app;
