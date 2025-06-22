import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Blockchain } from '../models/Blockchain.mjs';
import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';
import { MINING_REWARD, REWARD_ADDRESS } from '../utilities/constants.mjs';

import { describe, it, expect, beforeEach } from 'vitest';

describe('Blockchain', () => {
  let blockchain, wallet, transaction, rewardTransaction;

  beforeEach(() => {
    blockchain = new Blockchain();
    wallet = new Wallet();
    transaction = new Transaction({ sender: wallet, recipient: 'test-recipient', amount: 20 });
    rewardTransaction = Transaction.reward({ miner: wallet });
  });

  describe('validateTransactionData', () => {
    it('returns true for valid transaction data', () => {
      blockchain.addBlock([transaction, rewardTransaction]);
      expect(blockchain.validateTransactionData(blockchain.chain)).toBe(true);
    });

    it('throws error for invalid transaction data', () => {
      blockchain.addBlock([transaction, transaction]);
      expect(() => blockchain.validateTransactionData(blockchain.chain)).toThrow();
    });

    it('throws error for multiple reward transactions', () => {
      blockchain.addBlock([transaction, rewardTransaction, rewardTransaction]);
      expect(() => blockchain.validateTransactionData(blockchain.chain)).toThrow(
        'Too many reward transactions in block'
      );
    });
  });
});