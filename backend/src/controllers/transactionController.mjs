import { asyncCatch } from '../middleware/asyncCatch.mjs';
import { network, transactionPool } from '../server.mjs';
import { wallet } from '../walletInstance.mjs';
import Transaction from '../models/Transaction.mjs';
import AppError from '../utilities/AppError.mjs';

export const addTransaction = asyncCatch(async (req, res, next) => {
  const { amount, recipient } = req.body;
  if (!amount || !recipient) {
    return next(new AppError('Belopp och mottagare krävs', 400));
  }

  let transaction = transactionPool.transactionExists({ address: wallet.publicKey });
  
  try {
    if (transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount, chain: network.blockchain.chain });
    }
    
    // Lägg till transaktionen och sänd bara om den inte redan finns
    if (!transactionPool.transactionExists({ address: wallet.publicKey, id: transaction.id })) {
      transactionPool.addTransaction(transaction);
      network.broadcastTransaction(transaction);
    }
    
    res.status(201).json({ success: true, data: transaction });

  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

export const listAllTransactions = asyncCatch(async (req, res, next) => {
  res.status(200).json({ success: true, data: transactionPool.transactionMap });
});