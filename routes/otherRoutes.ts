import { Router, Request, Response } from 'express';
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
    changePassword,
    changeUsername
} from '../controllers/accountController';
import { createRoleChangeRequest, getRoleChangeRequests, deleteRoleChangeRequest } from '../controllers/roleChangeRequestController';

const router = Router();

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
router.post('/create-role-change-request', createRoleChangeRequest);
router.put('/get-role-change-requests', getRoleChangeRequests)
router.delete('/delete-role-change-request', deleteRoleChangeRequest);
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
