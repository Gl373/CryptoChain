import { createHash, stableStringify } from '../utilities/hash.mjs';
import { INITIAL_BALANCE } from '../utilities/constants.mjs';
import Transaction from './Transaction.mjs';
import pkg from 'elliptic';
const EC = pkg.ec;
const ec = new EC('secp256k1');

export default class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
  }

  sign(data) {
    return this.keyPair.sign(createHash(stableStringify(data))).toDER('hex');
  }

  static calculateBalance({ chain, address }) {
    let total = 0;
    let hasMadeTransaction = false;
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasMadeTransaction = true;
        }
        const amount = transaction.outputMap[address];
        if (amount) {
          total += amount;
        }
      }
      if (hasMadeTransaction) break;
    }
    return hasMadeTransaction ? total : total + INITIAL_BALANCE;
  }

  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({ chain, address: this.publicKey });
    }
    if (amount > this.balance) {
      throw new Error('Belopp överstiger saldo');
    }
    return new Transaction({ sender: this, recipient, amount });
  }
}