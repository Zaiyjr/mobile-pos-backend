import express from 'express';
import cors from 'cors';
import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares
app.use(cors(
    {
        origin: [
            "http://localhost:5173",
            ""
        ],
        credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 2. Routes
app.use('/api', rootRouter)

// 3. Error Handling
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ message: "ບໍ່ພົບເສັ້ນທາງ (Route) ນີ້ໃນລະບົບ!" });
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});
