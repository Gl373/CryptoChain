import mongoose from 'mongoose';
import Transaction, { TransactionModel } from './Transaction.mjs';
import AppError from '../utilities/AppError.mjs';

const transactionPoolSchema = new mongoose.Schema({
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

export const TransactionPoolModel = mongoose.model('TransactionPool', transactionPoolSchema);

export default class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  addTransaction(transaction) {
    if (!Transaction.validate(transaction)) {
      throw new AppError('Invalid transaction', 400);
    }
    this.transactionMap[transaction.id] = transaction;
    this.saveToDB();
  }

  transactionExists({ address }) {
    return Object.values(this.transactionMap).find(t => t.input.address === address);
  }

  validateTransactions() {
    return Object.values(this.transactionMap).filter(t => Transaction.validate(t));
  }

  clear() {
    this.transactionMap = {};
    this.saveToDB();
  }

  clearBlockTransactions(chain) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
    this.saveToDB();
  }

  async saveToDB() {
    const transactionsToSave = Object.values(this.transactionMap);
    if (transactionsToSave.length === 0) {
      await TransactionPoolModel.findOneAndUpdate({}, { transactions: [] }, { upsert: true });
      return;
    }

    const operations = transactionsToSave.map(tx => ({
      updateOne: {
        filter: { id: tx.id },
        update: { $set: { id: tx.id, outputMap: tx.outputMap, input: tx.input } },
        upsert: true
      }
    }));

    await TransactionModel.bulkWrite(operations);

    const transactionIds = transactionsToSave.map(tx => tx.id);
    const dbTransactions = await TransactionModel.find({ id: { $in: transactionIds } }).select('_id');
    const transactionObjectIds = dbTransactions.map(t => t._id);
    
    await TransactionPoolModel.findOneAndUpdate(
      {},
      { transactions: transactionObjectIds },
      { upsert: true }
    );
  }

  async loadFromDB() {
    const poolDoc = await TransactionPoolModel.findOne().populate('transactions');
    if (poolDoc && poolDoc.transactions) {
      poolDoc.transactions.forEach(t_doc => {
        const plainTx = t_doc.toObject();
        this.transactionMap[plainTx.id] = Transaction.fromDbObject(plainTx);
      });
    }
  }
}