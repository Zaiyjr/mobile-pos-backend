import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://mobile-pos-frontend.vercel.app" // 🔥 ປ່ຽນເປັນ URL ຂອງໜ້າບ້ານ (Frontend) ທີ່ທ່ານໄດ້ຈາກ Vercel ເດີ້
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Routes
app.get('/', (req, res) => {
    res.send("Welcome to Mobile POS API!");
});
app.use('/', rootRouter);

// 3. Error Handling
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ message: "ບໍ່ພົບເສັ້ນທາງ (Route) ນີ້ໃນລະບົບ!" });
});

// 4. Start Server (ກວດສອບວ່າ ຖ້າບໍ່ແມ່ນ Vercel ໃຫ້ລັນ listen ປົກກະຕິ)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT}`);
    });
}

// 🔥 ສິ່ງສຳຄັນທີ່ສຸດ: ຕ້ອງມີການ Export app ອອກມາໃຫ້ Vercel ເອົາໄປໃຊ້ງານ
export default app;