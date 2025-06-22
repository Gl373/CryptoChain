import mongoose from 'mongoose';
import { Block, BlockModel } from './Block.mjs';
import Transaction from './Transaction.mjs';
import { REWARD_ADDRESS, MINING_REWARD } from '../utilities/constants.mjs';
import { createHash } from '../utilities/hash.mjs';

const blockchainSchema = new mongoose.Schema({
  chain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' }]
});

export const BlockchainModel = mongoose.model('Blockchain', blockchainSchema);

export class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  async addBlock(data) {
    const newBlock = await Block.createBlock({ previousBlock: this.chain[this.chain.length - 1], data });
    this.chain.push(newBlock);
    await this.saveToDB();
    return newBlock;
  }

  async mineBlock({ transactions, minerWallet }) {
    const rewardTransaction = Transaction.reward({ miner: minerWallet });
    const blockTransactions = [rewardTransaction, ...transactions];
    const newBlock = await this.addBlock(blockTransactions);
    return newBlock;
  }

  async saveToDB() {
    await BlockchainModel.findOneAndUpdate(
      {},
      { chain: this.chain.map(block => block.id) },
      { upsert: true }
    );
  }

  async loadFromDB() {
    const blockchainDoc = await BlockchainModel.findOne().populate('chain');
    if (blockchainDoc && blockchainDoc.chain.length > 0) {
      this.chain = blockchainDoc.chain;
      if (!this.validateChain(this.chain) || !this.validateTransactionData(this.chain)) {
        throw new Error('Loaded chain is invalid');
      }
    }
  }

  static validateChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      throw new Error('Invalid genesis block');
    }
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const previousBlock = chain[i - 1];
      if (block.lastHash !== previousBlock.hash) {
        throw new Error('Invalid lastHash');
      }
      if (Block.blockHash(block) !== block.hash) {
        throw new Error('Invalid block hash');
      }
    }
    return true;
  }

  validateTransactionData(chain) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      let rewardCount = 0;
      const transactionSet = new Set();
      let blockBalance = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_ADDRESS.address) {
          rewardCount++;
          if (rewardCount > 1) {
            throw new Error('Too many reward transactions in block');
          }
          if (transaction.outputMap[Object.keys(transaction.outputMap)[0]] !== MINING_REWARD) {
            throw new Error('Invalid reward amount');
          }
        } else {
          if (!Transaction.validate(transaction)) {
            throw new Error('Invalid transaction outputMap or signature');
          }
          const outputTotal = Object.values(transaction.outputMap).reduce((sum, amt) => sum + amt, 0);
          if (transaction.input.amount !== outputTotal) {
            throw new Error('Invalid transaction balance');
          }
          blockBalance += transaction.input.amount;
        }
        const transactionId = transaction.id;
        if (transactionSet.has(transactionId)) {
          throw new Error('Duplicate transaction in block');
        }
        transactionSet.add(transactionId);
      }
    }
    return true;
  }

  async replaceChain(chain, shouldValidate = true) {
    if (chain.length <= this.chain.length) {
      throw new Error('Incoming chain is not longer');
    }
    if (!Blockchain.validateChain(chain)) {
      throw new Error('Invalid chain structure');
    }
    if (shouldValidate && !this.validateTransactionData(chain)) {
      throw new Error('Invalid transaction data in chain');
    }
    this.chain = chain;
    await this.saveToDB();
  }
}

export default Blockchain;