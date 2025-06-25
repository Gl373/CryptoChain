import WebSocket, { WebSocketServer } from 'ws';

const CHANNELS = {
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
  PEERS: 'PEERS',
};

export default class Network {
  constructor({ blockchain, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.sockets = [];
  }

  listen() {
    const server = new WebSocketServer({ port: process.env.SOCKET_PORT || 5001 });
    server.on('connection', (socket) => this.connectSocket(socket));
    this.connectToPeers();
    console.log(`Listening for peer-to-peer connections on: ${process.env.SOCKET_PORT || 5001}`);
  }

  connectToPeers() {
    const peers = process.env.NODES ? process.env.NODES.split(',') : [];
    peers.forEach(peer => {
      if (!this.sockets.some(s => s._peer === peer)) {
        const socket = new WebSocket(`ws://${peer}`);
        socket._peer = peer;
        socket.on('open', () => this.connectSocket(socket));
        socket.on('error', (err) => console.error(`Connection error to ${peer}:`, err.message));
      }
    });
  }

  connectSocket(socket) {
    if (!this.sockets.some(s => s._peer === socket._peer)) {
      this.sockets.push(socket);
      console.log('Socket connected. Alla peers:', this.sockets.map(s => s._peer || 'okänd'));
      console.log('Socket connected. Total sockets:', this.sockets.length);
      this.messageHandler(socket);
      this.sendChain(socket); // Skicka kedjan till ny ansluten nod
      this.broadcastPeers(socket); // Skicka peer-lista en gång
    }
  }

  sendChain(socket) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: CHANNELS.BLOCKCHAIN,
        data: this.blockchain.chain,
      }));
    }
  }

  sendTransaction(socket, transaction) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: CHANNELS.TRANSACTION,
        data: transaction,
      }));
    }
  }

  broadcastPeers(socket) {
    const peerList = this.sockets.map(s => s._peer || `localhost:${process.env.SOCKET_PORT}`).filter(p => p);
    socket.send(JSON.stringify({
      type: CHANNELS.PEERS,
      data: peerList,
    }));
  }

  messageHandler(socket) {
    socket.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log('Received message type:', parsedMessage.type); // Begränsad loggning
        switch (parsedMessage.type) {
          case CHANNELS.BLOCKCHAIN:
            try {
              await this.blockchain.replaceChain(parsedMessage.data);
              this.transactionPool.clearBlockTransactions(parsedMessage.data); // Rensa poolen
            } catch (err) {
              console.error('Error replacing chain:', err.message);
            }
            break; // Ta bort this.syncChains() här!
          case CHANNELS.TRANSACTION:
            if (!this.transactionPool.transactionMap[parsedMessage.data.id]) {
              this.transactionPool.addTransaction(parsedMessage.data);
            }
            break;
          case CHANNELS.PEERS:
            parsedMessage.data.forEach(peer => {
              if (!this.sockets.some(s => s._peer === peer) && peer !== `localhost:${process.env.SOCKET_PORT}`) {
                const newSocket = new WebSocket(`ws://${peer}`);
                newSocket._peer = peer;
                newSocket.on('open', () => this.connectSocket(newSocket));
                newSocket.on('error', (err) => console.error(`Peer connection error to ${peer}:`, err.message));
              }
            });
            break;
        }
      } catch (err) {
        console.error('WebSocket message error:', err.message);
      }
    });
  }

  syncChains() {
    this.sockets.forEach(socket => this.sendChain(socket));
  }
  
  broadcastTransaction(transaction) {
    console.log('Broadcastar transaktion till', this.sockets.length, 'peers');
    this.sockets.forEach(socket => {
      if (socket.readyState === WebSocket.OPEN) {
        this.sendTransaction(socket, transaction);
      }
    });
  }

  broadcastChain() {
    this.sockets.forEach(socket => {
      if (socket.readyState === WebSocket.OPEN) {
        this.sendChain(socket);
      }
    });
  }
}