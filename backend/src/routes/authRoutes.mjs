import express from 'express';
import { register, login } from '../controllers/authController.mjs';
import { listUsers } from '../controllers/userController.mjs';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', listUsers);

export default router;