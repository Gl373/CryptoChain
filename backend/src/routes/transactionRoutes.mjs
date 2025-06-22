import express from 'express';
import { addTransaction, listAllTransactions } from '../controllers/transactionController.mjs';
import { protect, restrictTo } from '../middleware/auth.mjs';

const router = express.Router();

router.post('/', protect, restrictTo('user'), addTransaction);
router.get('/', protect, restrictTo('user'), listAllTransactions);

export default router;