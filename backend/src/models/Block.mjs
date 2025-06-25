import mongoose from 'mongoose';
import { INITIAL_DIFFICULTY, MINE_RATE } from '../utilities/constants.mjs';
import { createHash, stableStringify } from '../utilities/hash.mjs';
import { v4 as uuidv4 } from 'uuid';


const blockSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  timestamp: { type: Number, required: true },
  lastHash: { type: String, required: true },
  hash: { type: String, required: true },
  data: { type: Array, default: [] },
  nonce: { type: Number, default: 0 },
  difficulty: { type: Number, default: INITIAL_DIFFICULTY },
});

export const BlockModel = mongoose.model('Block', blockSchema);

export class Block {
  constructor({ id, timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.id = id;
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return {
      id: 'genesis-id',
      timestamp: 1,
      lastHash: '-----',
      hash: 'genesis-hash',
      data: [],
      nonce: 0,
      difficulty: 3
    };
  }

  static async createBlock({ previousBlock, data }) {
    const timestamp = Date.now();
    const lastHash = previousBlock.hash;
    const id = uuidv4();
    const { nonce, difficulty, hash } = await Block.mineBlock({ previousBlock, data });

    const newBlockInstance = new Block({ id, timestamp, lastHash, hash, data, nonce, difficulty });
    
    const savedBlockDocument = await BlockModel.create(newBlockInstance);
    newBlockInstance._id = savedBlockDocument._id;
    return newBlockInstance;
  }

  static async mineBlock({ previousBlock, data }) {
    let hash, timestamp, nonce = 0, difficulty = previousBlock.difficulty;
    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({ block: previousBlock, timestamp });
      hash = createHash(timestamp, previousBlock.hash, stableStringify(data), nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));
    return { nonce, difficulty, hash };
  }

  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return createHash(timestamp, lastHash, stableStringify(data), nonce, difficulty);
  }

  static adjustDifficulty({ block, timestamp }) {
    const { difficulty } = block;
    if (difficulty < 1) return 1;
    return timestamp - block.timestamp > MINE_RATE ? difficulty - 1 : difficulty + 1;
  }
}