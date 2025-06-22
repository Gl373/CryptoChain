import Blockchain from './models/Blockchain.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Wallet from './models/Wallet.mjs';

export const blockchain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet(); 