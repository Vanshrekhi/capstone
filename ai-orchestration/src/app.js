import express from 'express';
import agentRouter from './routes/agent.routes.js'
import morgan from 'morgan';
import cors from 'cors';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    origin: "*",
}));
app.use(express.json());

app.get('/api/status/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use("/api/ai", agentRouter)

export default app;