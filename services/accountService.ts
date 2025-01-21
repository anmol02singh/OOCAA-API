const accountRepository = require('../repositories/accountRepository');

async function register(name: string, username: string, password: string) {
    return await accountRepository.register(name, username, password);
};

async function login(username: string, password: string): Promise<boolean> {
    return await accountRepository.login(username, password);
};

module.exports = {
    register,
    login
};
