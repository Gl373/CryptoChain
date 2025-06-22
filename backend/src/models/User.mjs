import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Måste vara en giltig e-postadress']
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  publicKey: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


export const User = mongoose.model('User', userSchema);