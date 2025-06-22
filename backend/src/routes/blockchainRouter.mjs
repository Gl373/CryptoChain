import express from 'express';
import { listAllBlocks, addBlock, findBlock } from '../controllers/blockchainController.mjs';
import { protect, restrictTo } from '../middleware/auth.mjs';
import { miningBlock } from '../controllers/blockchainController.mjs';

const router = express.Router();

router.route('/')
  .get(listAllBlocks)
  .post(addBlock);

router.get('/:hash', findBlock);

router.post('/mining', protect, restrictTo('user'), miningBlock);

export default router;