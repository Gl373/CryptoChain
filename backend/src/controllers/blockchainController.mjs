import Blockchain from '../models/Blockchain.mjs';
import { asyncCatch } from '../middleware/asyncCatch.mjs';
import AppError from '../utilities/AppError.mjs';
import Transaction from '../models/Transaction.mjs';
import { blockchain, network, transactionPool } from '../server.mjs';
import { wallet } from '../walletInstance.mjs';

export const listAllBlocks = asyncCatch(async (req, res) => {
  res.status(200).json({
    success: true,
    data: blockchain
  });
});

export const addBlock = asyncCatch(async (req, res) => {
  const { id, amount, sender, receiver } = req.body;
  if (!id || !amount || !sender || !receiver) {
    throw new AppError('Transaction requires id, amount, sender, and receiver', 400);
  }
  const transaction = new Transaction({ id, amount, sender, receiver });
  await blockchain.addBlock({ data: { ...transaction } });
  res.status(201).json({
    success: true,
    data: blockchain.chain[blockchain.chain.length - 1]
  });
});

export const findBlock = asyncCatch(async (req, res) => {
  const { hash } = req.params;
  const block = blockchain.chain.find(b => b.hash === hash);
  if (!block) {
    throw new AppError(`Block with hash ${hash} not found`, 404);
  }
  res.status(200).json({
    success: true,
    data: block
  });
});

export const miningBlock = asyncCatch(async (req, res, next) => {
  console.log('Block 1 efter mining:', JSON.stringify(blockchain.chain[1], null, 2));
  if (transactionPool && Object.keys(transactionPool.transactionMap).length === 0) {
    return next(new AppError('Inga transaktioner att minera', 400));
  }

  const validTransactions = Object.values(transactionPool.transactionMap);

  const block = await blockchain.mineBlock({
    transactions: validTransactions,
    minerWallet: wallet
  });

  transactionPool.clear();
  network.syncChains();

  res.status(201).json({ success: true, data: block });
});