import express from 'express';
import {
    register,
    login,
    userdata,
    deleteOwnAccount,
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
// Deletes the account with the provided token.  Only used for testing.
router.delete('/deleteOwnAccount', deleteOwnAccount);
router.post('/getAccounts', getAccounts);
router.put('/updateGeneralUserData', updateGeneralUserData);
router.put('/updateAccountsRole', updateAccountsRole);
// Deletes multiple accounts using a token.  Used for the application itself.
router.delete('/deleteAccounts', deleteAccounts);
router.put('/updateProfileImage', updateProfileImage);
router.delete('/removeProfileImage', removeProfileImage);
router.delete('/repairProfileImageSource', repairProfileImageSource);

export default router
