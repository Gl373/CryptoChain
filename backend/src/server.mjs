import app from './app.mjs';
import { connectDB } from '../config/db.mjs';
import Blockchain from './models/Blockchain.mjs';
import { wallet } from './walletInstance.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Network from './network.mjs';

export const blockchain = new Blockchain();
export const transactionPool = new TransactionPool();
export const network = new Network({ blockchain, transactionPool, wallet });

const main = async () => {
  await connectDB();
  
  await blockchain.loadFromDB();
  await transactionPool.loadFromDB();

  network.listen();   
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV === 'test') {
}

main();