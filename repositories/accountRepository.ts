import { Types } from 'mongoose';
const Account = require('../models/account');
const bcrypt = require('bcryptjs');

async function register(name: string, username: string, password: string) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    const account = new Account({ name: name, username: username, passwordHash: hash, role: "user" });
    return await account.save();
};

async function login(username: string, password: string): Promise<boolean> {
    const account = await Account.findOne({ username: username }).exec();
    return bcrypt.compareSync(password, account.passwordHash);
};

module.exports = {
    register,
    login
};
