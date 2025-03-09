import express from 'express';
import {
    register,
    login,
    userdata,
    updateGeneralUserData,
    updateProfileImage,
    removeProfileImage,
} from '../controllers/accountController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/userdata', userdata);
router.put('/updateGeneralUserData', updateGeneralUserData);
router.put('/updateProfileImage', updateProfileImage);
router.delete('/removeProfileImage', removeProfileImage);

export default router
