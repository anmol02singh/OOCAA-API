import express from 'express';
import { register, login, userdata } from '../controllers/accountController';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/userdata', userdata);

export default router
