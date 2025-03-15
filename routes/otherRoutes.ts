import express from 'express';
import {
    register,
    login,
    userdata,
    updateGeneralUserData,
    updateProfileImage,
    removeProfileImage,
    repairProfileImageSource,
    changePassword
} from '../controllers/accountController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/userdata', userdata);
router.put('/updateGeneralUserData', updateGeneralUserData);
router.put('/updateProfileImage', updateProfileImage);
router.delete('/removeProfileImage', removeProfileImage);
router.delete('/repairProfileImageSource', repairProfileImageSource);
router.post('/change-password', changePassword);

export default router
