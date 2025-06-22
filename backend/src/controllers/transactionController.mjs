import { asyncCatch } from '../middleware/asyncCatch.mjs';
import { blockchain, transactionPool, wallet } from '../state.mjs';
import Transaction from '../models/Transaction.mjs';
import AppError from '../utilities/AppError.mjs';

export const addTransaction = asyncCatch(async (req, res, next) => {
  const { amount, recipient } = req.body;
  if (!amount || !recipient) {
    return next(new AppError('Belopp och mottagare krävs', 400));
  }
  let transaction = transactionPool.transactionExists({ address: wallet.publicKey });
  if (transaction) {
    transaction.update({ sender: wallet, recipient, amount });
    transactionPool.addTransaction(transaction);
  } else {
    transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
    transactionPool.addTransaction(transaction);
  }
  res.status(201).json({ success: true, data: transaction });
});

export const listAllTransactions = asyncCatch(async (req, res, next) => {
  res.status(200).json({ success: true, data: transactionPool.transactionMap });
});