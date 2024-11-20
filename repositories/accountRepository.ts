import { Types } from 'mongoose';
const Account = require('../models/account');

async function register(username: string, password: string) {
    const account = new Account({ username: username, passwordHash: password });
    return await account.save();
};

async function login(username: string, password: string): Promise<boolean> {
    const account = await Account.findOne({ username: username }).exec();
    return password == account.passwordHash;
};

module.exports = {
    register,
    login
};
