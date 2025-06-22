import { describe, it, expect, beforeEach } from 'vitest';
import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';
import { MINING_REWARD, REWARD_ADDRESS } from '../utilities/constants.mjs';

describe('Transaction', () => {
  let wallet, recipient, amount, transaction;

  beforeEach(() => {
    wallet = new Wallet();
    recipient = 'test-recipient';
    amount = 20;
    transaction = new Transaction({ sender: wallet, recipient, amount });
  });

  it('should have an id property', () => {
    expect(transaction).toHaveProperty('id');
  });

  it('should have an outputMap with recipient amount', () => {
    expect(transaction.outputMap[recipient]).toEqual(amount);
  });

  it('should return true for valid transaction', () => {
    expect(Transaction.validate(transaction)).toBe(true);
  });
});