import express from 'express';
import {
    register,
    login,
    userdata,
    deleteAccount,
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
// Deletes one account, without requiring authentication.  Only used for testing.
router.post('/deleteAccount', deleteAccount);
router.post('/getAccounts', getAccounts);
router.put('/updateGeneralUserData', updateGeneralUserData);
router.put('/updateAccountsRole', updateAccountsRole);
// Deletes multiple accounts using a token.  Used for the application itself.
router.delete('/deleteAccounts', deleteAccounts);
router.put('/updateProfileImage', updateProfileImage);
router.delete('/removeProfileImage', removeProfileImage);
router.delete('/repairProfileImageSource', repairProfileImageSource);

export default router
