import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import rootRouter from '../src/routes/index.js';
import { errorHandler } from '../src/middlewares/error.middleware.js';

const app = express();
const allowedOrigins = [
    "http://localhost:5173",
    "https://mobile-pos-frontend.vercel.app",
    "https://frontend-eta-jade-32.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

// Middlewares
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

// Routes
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Mobile POS API!", status: "ok" });
});

app.use('/api', rootRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ test: "success", data: { message: "API is working!" } });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "ບໍ່ພົບເສັ້ນທາງ (Route) ນີ້ໃນລະບົບ!" });
});

// Error handler
app.use(errorHandler);

// Export as Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
    return app(req, res);
};
