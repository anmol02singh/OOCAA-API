import express from 'express';
import { register, login, userdata, updateGeneralUserData } from '../controllers/accountController';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/userdata', userdata);
router.put('/updateGeneralUserData', updateGeneralUserData);

export default router
