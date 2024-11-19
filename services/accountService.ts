const accountRepository = require('../repositories/accountRepository');

async function register(username: string, password: string) {
    return await accountRepository.register(username, password);
};

module.exports = {
    register
};
