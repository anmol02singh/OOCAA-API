import express, { Router, Request, Response } from 'express';
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
    changePassword,
    changeUsername
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
router.post('/change-password', changePassword);
router.post('/change-username', (req: Request, res: Response) => {
    changeUsername(req, res).catch(error => {
        console.error("Unhandled error in /change-username route:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
});

export default router
