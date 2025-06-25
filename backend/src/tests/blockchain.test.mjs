import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Blockchain } from '../models/Blockchain.mjs';
import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Blockchain', () => {
  let blockchain, wallet, transaction, rewardTransaction;

  beforeEach(() => {
    blockchain = new Blockchain();
    wallet = new Wallet();
    transaction = new Transaction({ sender: wallet, recipient: 'test-recipient', amount: 20 });
    rewardTransaction = Transaction.reward({ minerWallet: wallet });
  });

  describe('validateTransactionData', () => {
    it('returns true for valid transaction data', async () => {
      await blockchain.addBlock([transaction, rewardTransaction]);
      expect(blockchain.validateTransactionData(blockchain.chain)).toBe(true);
    }, 20000);

    it('returns false for invalid transaction data', async () => {
      await blockchain.addBlock([transaction, transaction]);
      expect(blockchain.validateTransactionData(blockchain.chain)).toBe(false);
    }, 20000);
    
    it('returns false for multiple reward transactions', async () => {
      await blockchain.addBlock([transaction, rewardTransaction, rewardTransaction]);
      expect(blockchain.validateTransactionData(blockchain.chain)).toBe(false);
    }, 20000);
  });
}); 