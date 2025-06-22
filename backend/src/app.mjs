import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.mjs';
import transactionRoutes from './routes/transactionRoutes.mjs';
import blockchainRoutes from './routes/blockchainRouter.mjs';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/blocks', blockchainRoutes);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Serverfel'
  });
});

export default app;