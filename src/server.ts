import 'dotenv/config';
import { createApp } from "./shared/presentation/http/app.js";

const app = createApp();
const PORT = process.env.PORT || 5000;

// 4. Start Server (ກວດສອບວ່າ ຖ້າບໍ່ແມ່ນ Vercel ໃຫ້ລັນ listen ປົກກະຕິ)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT}`);
    });
}

// 🔥 ສິ່ງສຳຄັນທີ່ສຸດ: ຕ້ອງມີການ Export app ອອກມາໃຫ້ Vercel ເອົາໄປໃຊ້ງານ
export default app;
