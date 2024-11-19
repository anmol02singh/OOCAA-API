import { Types } from 'mongoose';
const Account = require('../models/account');

async function register(username: string, password: string) {
    const account = new Account({ username: username, passwordHash: password });
    return await account.save();
};

module.exports = {
    register
};
