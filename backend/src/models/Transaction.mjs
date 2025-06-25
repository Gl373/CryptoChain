import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { createHash, stableStringify } from '../utilities/hash.mjs';
import { MINING_REWARD, REWARD_ADDRESS } from '../utilities/constants.mjs';
import pkg from 'elliptic';
const EC = pkg.ec;
const ec = new EC('secp256k1');

const transactionSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  outputMap: { type: Object, required: true },
  input: {
    timestamp: Number,
    amount: Number,
    address: String,
    signature: String,
  },
});

export const TransactionModel = mongoose.model('Transaction', transactionSchema);

export default class Transaction {
  constructor({ sender, recipient, amount }) {
    this.id = uuidv4().replace(/-/g, '');
    this.outputMap = this.createOutputMap(sender, recipient, amount);
    this.input = this.createInput(sender, this.outputMap);
  }

  createOutputMap(sender, recipient, amount) {
    const map = {};
    map[recipient] = amount;
    map[sender.publicKey] = sender.balance - amount;
    return map;
  }

  createInput(sender, outputMap) {
    return {
      timestamp: Date.now(),
      amount: sender.balance,
      address: sender.publicKey,
      signature: sender.sign(outputMap),
    };
  }

  static validate(transaction) {
    const {
      outputMap,
      input: { address, amount, signature },
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce((sum, amt) => sum + amt, 0);
    
    if (amount !== outputTotal) {
      return false;
    }

    const key = ec.keyFromPublic(address, 'hex');
    return key.verify(createHash(stableStringify(outputMap)), signature);
  }

  static reward({ minerWallet }) {
    const transaction = Object.create(this.prototype);
    transaction.id = uuidv4().replace(/-/g, '');
    transaction.outputMap = { [minerWallet.publicKey]: MINING_REWARD };
    transaction.input = {
      timestamp: Date.now(),
      amount: MINING_REWARD,
      address: REWARD_ADDRESS.address,
      signature: 'reward-signature'
    };
    return transaction;
  }

  update({ sender, recipient, amount }) {
    if (amount > this.outputMap[sender.publicKey]) {
      throw new Error('Amount exceeds balance');
    }
    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] += amount;
    }
    this.outputMap[sender.publicKey] -= amount;
    this.input = this.createInput(sender, this.outputMap);
  }

  static fromDbObject({ id, outputMap, input }) {
    const transaction = Object.create(Transaction.prototype);
    transaction.id = id;
    transaction.outputMap = outputMap;
    transaction.input = input;
    return transaction;
  }
}