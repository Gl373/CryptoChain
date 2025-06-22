import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.mjs';
import { User } from '../models/User.mjs';
import mongoose from 'mongoose';
import Wallet from '../models/Wallet.mjs';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/cryptochain-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      username: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data.username', 'testuser@example.com');
    });

  it('should login with correct credentials', async () => {
    const wallet = new Wallet();
    await User.create({ username: 'testuser@example.com', password: 'password123', publicKey: wallet.publicKey, privateKey: wallet.keyPair.getPrivate('hex') });
    const res = await request(app).post('/api/v1/auth/login').send({
      username: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data.token');
  });
});