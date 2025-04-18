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

export async function deleteAccount(username: string): Promise<boolean> {
    return await repoDelete(username);
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
