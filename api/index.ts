import 'dotenv/config';
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://mobile-pos-frontend.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Mobile POS API!", status: "ok" });
});

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
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);
    res.status(500).json({ 
        message: "Internal Server Error", 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Export as Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
    return app(req, res);
};
