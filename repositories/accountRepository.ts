import { Types } from 'mongoose';
const Account = require('../models/account');
const bcrypt = require('bcryptjs');

async function register(name: string, username: string, password: string): Promise<boolean> {
    if (await Account.findOne({ username: username }).exec()) {
        return false;
    }

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    const account = new Account({ name: name, username: username, passwordHash: hash, role: "user" });
    if (await account.save()) {
        return true;
    } else {
        return false;
    }
};

async function login(username: string, password: string): Promise<boolean> {
    const account = await Account.findOne({ username: username }).exec();
    return bcrypt.compareSync(password, account.passwordHash);
};

async function userdata(username: string): Promise<object> {
    const account = await Account.findOne({ username: username }).exec();
    return {
        name: account.name, username: username, role: account.role,
        email: account.email, phoneNumber: account.phoneNumber
    };
}

module.exports = {
    register,
    login,
    userdata
};
