import express from 'express';
import {
    register,
    login,
    userdata,
    getAccounts,
    updateGeneralUserData,
    updateAccountsRole,
    deleteAccounts,
    updateProfileImage,
    removeProfileImage,
    repairProfileImageSource,
} from '../controllers/accountController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/userdata', userdata);
router.post('/getAccounts', getAccounts);
router.put('/updateGeneralUserData', updateGeneralUserData);
router.put('/updateAccountsRole', updateAccountsRole);
router.delete('/deleteAccounts', deleteAccounts);
router.put('/updateProfileImage', updateProfileImage);
router.delete('/removeProfileImage', removeProfileImage);
router.delete('/repairProfileImageSource', repairProfileImageSource);

export default router
