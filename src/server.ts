import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    "http://localhost:5173",
    "https://frontend-eta-jade-32.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

// 1. Middlewares
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
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
