import 'dotenv/config';
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import rootRouter from '../src/routes/index.js';
import { errorHandler } from '../src/middlewares/error.middleware.js';

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
    res.send("Welcome to Mobile POS API!");
});
app.use('/', rootRouter);

// Error Handling
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ message: "ບໍ່ພົບເສັ້ນທາງ (Route) ນີ້ໃນລະບົບ!" });
});

// Export as Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
    return app(req, res);
};
