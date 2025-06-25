import mongoose from 'mongoose';
import { Block, BlockModel } from './Block.mjs';
import Transaction from './Transaction.mjs';
import { REWARD_ADDRESS, MINING_REWARD } from '../utilities/constants.mjs';
import { createHash } from '../utilities/hash.mjs';

const blockchainSchema = new mongoose.Schema({
  chain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' }]
});

export const BlockchainModel = mongoose.model('Blockchain', blockchainSchema);

function cleanBlock(block) {
  const { id, timestamp, lastHash, hash, data, nonce, difficulty } = block;
  return { id, timestamp, lastHash, hash, data, nonce, difficulty };
}

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
    const rewardTransaction = Transaction.reward({ minerWallet });
    const blockTransactions = [rewardTransaction, ...transactions];
    const newBlock = await this.addBlock(blockTransactions);
    return newBlock;
  }

  async saveToDB() {
    const savePromises = this.chain.map(block => {
      return BlockModel.findOneAndUpdate(
        { id: block.id },
        cleanBlock(block),
        { upsert: true, new: true }
      );
    });
    const savedBlocks = await Promise.all(savePromises);
    await BlockchainModel.findOneAndUpdate(
      {},
      { chain: savedBlocks.map(block => block._id) },
      { upsert: true }
    );
  }

  async loadFromDB() {
    const blockchainDoc = await BlockchainModel.findOne().populate('chain');
    if (blockchainDoc && blockchainDoc.chain.length > 0) {
      this.chain = blockchainDoc.chain.map(block => {
        return {
          id: block.id,
          timestamp: block.timestamp,
          lastHash: block.lastHash,
          hash: block.hash,
          data: block.data,
          nonce: block.nonce,
          difficulty: block.difficulty
        };
      });
      if (!Blockchain.validateChain(this.chain) || !this.validateTransactionData(this.chain)) {
        console.error('Loaded chain is invalid, resetting to genesis');
        this.chain = [Block.genesis()];
        await this.saveToDB();
      }
    }
  }

  static validateChain(chain) {
    const clean = block => {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = block;
      return { timestamp, lastHash, hash, data, nonce, difficulty };
    };
    if (JSON.stringify(clean(chain[0])) !== JSON.stringify(clean(Block.genesis()))) {
      console.error('Genesis block mismatch');
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const previousBlock = chain[i - 1];
      if (block.lastHash !== previousBlock.hash) {
        console.error('Invalid lastHash at block', i);
        return false;
      }
      if (Block.blockHash(block) !== block.hash) {
        console.error('Invalid block hash at block', i);
        return false;
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
            console.error('Too many reward transactions in block', i);
            return false;
          }
          if (transaction.outputMap[Object.keys(transaction.outputMap)[0]] !== MINING_REWARD) {
            console.error('Invalid reward amount in block', i);
            return false;
          }
        } else {
          if (!Transaction.validate(transaction)) {
            console.error('Invalid transaction in block', i);
            return false;
          }
          const outputTotal = Object.values(transaction.outputMap).reduce((sum, amt) => sum + amt, 0);
          if (transaction.input.amount !== outputTotal) {
            console.error('Invalid transaction balance in block', i);
            return false;
          }
          blockBalance += transaction.input.amount;
        }
        const transactionId = transaction.id;
        if (transactionSet.has(transactionId)) {
          console.error('Duplicate transaction in block', i);
          return false;
        }
        transactionSet.add(transactionId);
      }
    }
    return true;
  }

  async replaceChain(chain, shouldValidate = true) {
    console.log('replaceChain called with chain:', JSON.stringify(chain, null, 2));
    if (chain.length <= this.chain.length) {
      console.log('Block 1 på denna nod:', JSON.stringify(chain[1], null, 2));
      console.log('Incoming chain is not longer than the current chain. Not replacing.');
      return;
    }
    if (shouldValidate && (!Blockchain.validateChain(chain) || !this.validateTransactionData(chain))) {
      console.error('Incoming chain is invalid or has invalid transaction data. Not replacing.');
      return;
    }
    console.log('Replacing the current chain with the new chain.');
    this.chain = chain;
    await this.saveToDB();
  }
}

export default Blockchain;