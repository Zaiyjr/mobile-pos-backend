import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import rootRouter from '../src/routes/index.js';
import { errorHandler } from '../src/middlewares/error.middleware.js';

const app = express();

// Define allowed origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mobile-pos-frontend.vercel.app",
    "https://frontend-eta-jade-32.vercel.app",
].filter(Boolean);

// CORS middleware with proper preflight handling
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'JWT'],
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Mobile POS API!", status: "ok" });
});

// API Routes - all under /api
app.use('/api', rootRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
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
