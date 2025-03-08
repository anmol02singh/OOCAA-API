import express from 'express';
import {
    register,
    login,
    userdata,
    updateGeneralUserData,
    updateProfileImage
} from '../controllers/accountController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/userdata', userdata);
router.put('/updateGeneralUserData', updateGeneralUserData);
router.put('/updateProfileImage', updateProfileImage);

export default router
