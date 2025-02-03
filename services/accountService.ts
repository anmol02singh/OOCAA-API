import { register as repoRegister } from '../repositories/accountRepository';
import { login as repoLogin } from '../repositories/accountRepository';
import { userdata as repoUserdata } from '../repositories/accountRepository';

export async function register(name: string, username: string, password: string) {
    return await repoRegister(name, username, password);
};

export async function login(username: string, password: string): Promise<boolean> {
    return await repoLogin(username, password);
};

export async function userdata(username: string): Promise<object> {
    return await repoUserdata(username);
};
