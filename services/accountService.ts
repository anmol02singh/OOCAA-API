import {
    register as repoRegister,
    login as repoLogin,
    userdata as repoUserdata,
    deleteAccount as repoDelete,
    getAccounts as repoGetAccounts,
    updateGeneralUserData as repoUpdateUserData,
    updateAccountsRole as repoUpdateAccountsRole,
    deleteAccounts as repoDeleteAccounts,
    updateProfileImage as repoUpdateProfileImage,
    removeProfileImage as repoRemoveProfileImage,
    repairProfileImageSource as repoRepairProfileImageSource,
    changePassword as repoChangePassword ,
    changeUsername as repoChangeUsername,
    findUserByUsername as repoFindUserByUsername
} from '../repositories/accountRepository';

export async function register(name: string, email: string, phone: string, username: string, password: string): Promise<string> {
    return await repoRegister(name, email, phone, username, password);
};

export async function login(usernameOrEmail: string, password: string): Promise<{success: boolean, username: string | undefined}> {
    return await repoLogin(usernameOrEmail, password);
};

export async function userdata(username: string): Promise<object> {
    return await repoUserdata(username);
};

export async function deleteAccount(username: string): Promise<boolean> {
    return await repoDelete(username);
};

export async function getAccounts(
    _id?: string,
    name?: string,
    username?: string,
    role?: number,
    email?: string,
    phoneNumber?: string,
): Promise<object>{
    return await repoGetAccounts(
        _id,
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

export async function changeUsername(
    currentUsername: string,
    newUsername: string
): Promise<{ success: boolean; message: string }> {
    try {
        if (!newUsername) { /* ... */ }
        if (newUsername.length < 4) { /* ... */ }
        if (newUsername === currentUsername) { /* ... */ }
        if (!/^[a-zA-Z0-9_.]+$/.test(newUsername)) { /* ... */ }
        if (/\.\./.test(newUsername)) { /* ... */ }
        if (/^\.|\.$/.test(newUsername)) { /* ... */ }

        const existingUser = await repoFindUserByUsername(newUsername); 
        if (existingUser) {
             return { success: false, message: `Username "${newUsername}" is already taken.` };
        }
        const success = await repoChangeUsername(currentUsername, newUsername);

        return {
            success,
            message: success ? "Username updated successfully" : "Failed to update username in database." 
        };
    } catch (error) {
        console.error("Error in changeUsername service:", error);
  
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error occurred while changing username."
        };
    }
}
