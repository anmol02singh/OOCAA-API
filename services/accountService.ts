// import { changePassword } from '../controllers/accountController';
import {
    register as repoRegister,
    login as repoLogin,
    userdata as repoUserdata,
    getAccounts as repoGetAccounts,
    updateGeneralUserData as repoUpdateUserData,
    updateAccountsRole as repoUpdateAccountsRole,
    deleteAccounts as repoDeleteAccounts,
    updateProfileImage as repoUpdateProfileImage,
    removeProfileImage as repoRemoveProfileImage,
    repairProfileImageSource as repoRepairProfileImageSource,
    changePassword as repoChangePassword ,
    changeUsername as repoChangeUsername
} from '../repositories/accountRepository';

export async function register(name: string, email: string, phone: string, username: string, password: string): Promise<string> {
    return await repoRegister(name, email, phone, username, password);
};

export async function login(username: string, password: string): Promise<boolean> {
    return await repoLogin(username, password);
};

export async function userdata(username: string): Promise<object> {
    return await repoUserdata(username);
};

export async function getAccounts(
    name?: string,
    username?: string,
    role?: number,
    email?: string,
    phoneNumber?: string,
): Promise<object>{
    return await repoGetAccounts(
        name,
        username,
        role,
        email,
        phoneNumber,
    );
}

export async function updateGeneralUserData(
    currentUsername: string,
    newName?: string,
    // newUsername?: string,
    newEmail?: string,
    newPhone?: string
): Promise<{success: boolean, message: string}> {
    return await repoUpdateUserData(
        currentUsername,
        newName,
        // newUsername,
        newEmail,
        newPhone
    );
};

export async function updateAccountsRole(usernames: string, role: number): Promise<boolean> {
    return await repoUpdateAccountsRole(usernames, role);
}

export async function deleteAccounts(usernames: string): Promise<boolean> {
    return await repoDeleteAccounts(usernames);
}

export async function updateProfileImage(currentUsername: string, newImage: string): Promise<boolean> {
    return await repoUpdateProfileImage(currentUsername, newImage);
}

export async function removeProfileImage(currentUsername: string): Promise<boolean> {
    return await repoRemoveProfileImage(currentUsername);
}

export async function repairProfileImageSource(currentUsername: string): Promise<boolean> {
    return await repoRepairProfileImageSource(currentUsername);
}
export async function changePassword(
    currentUsername: string,
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; message: string }> {
    try {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return { 
                success: false, 
                message: "Password must contain: 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character" 
            };
        }

        const success = await repoChangePassword(currentUsername, currentPassword, newPassword);
        
        return {
            success,
            message: success ? "Password updated successfully" : "Password change failed"
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Password change failed"
        };
    }
}
// In services/accountService.ts
export async function changeUsername(
    currentUsername: string,
    newUsername: string
): Promise<{ success: boolean; message: string }> {
    try {
        // Validate username requirements
        if (!newUsername) {
            return { success: false, message: "Username is required" };
        }
        if (newUsername.length < 4) {
            return { success: false, message: "Username must be at least 4 characters" };
        }
        if (newUsername === currentUsername) {
            return { success: false, message: "New username cannot be the same as current" };
        }

        // Check for valid characters (letters, numbers, underscores)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(newUsername)) {
            return { success: false, message: "Username can only contain letters, numbers, and underscores" };
        }

        // Call repository function
        const success = await repoChangeUsername(currentUsername, newUsername);
        
        return {
            success,
            message: success ? "Username updated successfully" : "Username change failed"
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Username change failed"
        };
    }
}