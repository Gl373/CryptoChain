import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../config/config.env') });

const clearDatabase = async () => {
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI not found in .env file.');
    return;
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected.');

    console.log('Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully!');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
};

clearDatabase(); 