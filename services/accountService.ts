import { register as repoRegister } from '../repositories/accountRepository';
import { login as repoLogin } from '../repositories/accountRepository';
import { userdata as repoUserdata } from '../repositories/accountRepository';
import { updateGeneralUserData as repoUpdateUserData } from '../repositories/accountRepository';

export async function register(name: string, email: string, phone: string, username: string, password: string): Promise<string> {
    return await repoRegister(name, email, phone, username, password);
};

export async function login(username: string, password: string): Promise<boolean> {
    return await repoLogin(username, password);
};

export async function userdata(username: string): Promise<object> {
    return await repoUserdata(username);
};

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
