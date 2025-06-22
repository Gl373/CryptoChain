import WebSocket, { WebSocketServer } from 'ws';
import { blockchain, transactionPool } from './state.mjs';
import { Blockchain } from './models/Blockchain.mjs';

export function setupWebSocket(port, peers = []) {
  const wss = new WebSocketServer({ port });
  const sockets = [];

  wss.on('connection', (ws) => {
    sockets.push(ws);
    console.log('New client connected');
    ws.send(JSON.stringify({ channel: 'BLOCKCHAIN', data: JSON.stringify(blockchain.chain) }));
    ws.on('message', (message) => {
      try {
        const { channel, data } = JSON.parse(message);
        if (channel === 'BLOCKCHAIN') {
          const chain = JSON.parse(data);
          if (Blockchain.validateChain(chain) && chain.length > blockchain.chain.length) {
            blockchain.replaceChain(chain);
            transactionPool.clearBlockTransactions(chain);
            broadcast({ channel: 'BLOCKCHAIN', data: JSON.stringify(chain) }, ws);
          }
        } else if (channel === 'TRANSACTION') {
          const transaction = JSON.parse(data);
          if (!transactionPool.transactionExists({ address: transaction.input.address })) {
            transactionPool.addTransaction(transaction);
            broadcast({ channel: 'TRANSACTION', data: JSON.stringify(transaction) }, ws);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  peers.forEach(address => {
    const ws = new WebSocket(address);
    ws.on('open', () => {
      sockets.push(ws);
      ws.send(JSON.stringify({ channel: 'BLOCKCHAIN', data: JSON.stringify(blockchain.chain) }));
    });
    ws.on('message', (message) => {
      try {
        const { channel, data } = JSON.parse(message);
        if (channel === 'BLOCKCHAIN') {
          const chain = JSON.parse(data);
          if (Blockchain.validateChain(chain) && chain.length > blockchain.chain.length) {
            blockchain.replaceChain(chain);
            transactionPool.clearBlockTransactions(chain);
            broadcast({ channel: 'BLOCKCHAIN', data: JSON.stringify(chain) }, ws);
          }
        } else if (channel === 'TRANSACTION') {
          const transaction = JSON.parse(data);
          if (!transactionPool.transactionExists({ address: transaction.input.address })) {
            transactionPool.addTransaction(transaction);
            broadcast({ channel: 'TRANSACTION', data: JSON.stringify(transaction) }, ws);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    ws.on('close', () => {
      console.log('Disconnected from peer', address);
    });
  });

  function broadcast(data, excludeWs) {
    sockets.forEach(ws => {
      if (ws.readyState === ws.OPEN && ws !== excludeWs) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  return {
    broadcastChain: () => broadcast({ channel: 'BLOCKCHAIN', data: JSON.stringify(blockchain.chain) }),
    broadcastTransaction: (transaction) => broadcast({ channel: 'TRANSACTION', data: JSON.stringify(transaction) })
  };
}