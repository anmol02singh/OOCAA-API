import Account, { AccountType } from '../models/account';
import RoleChangeRequest, { RoleChangeRequestType } from '../models/roleChangeRequest';

// export const createRoleChangeRequest = async (currentUsername: string): Promise<boolean> { 
//     //User object to update.
//     const changeRequest = await RoleChangeRequest.findOne({ username: currentUsername }).exec();
//     if (!account) return { success: false, message: "User account update cancelled: account with given username could not be found." };
    
//     const account = new Account({ name: processedName, email: processedEmail, phoneNumber: phone, username: processedUsername, passwordHash: hash, role: 2 });
//         if (await account.save()) {
//             return "";
//         } else {
//             throw new Error("Error saving account in database.");
//         }
    
    
// }