import { Types } from 'mongoose';
import Account from '../models/account';

const bcrypt = require('bcryptjs');

// if an error happens, returns a string containing that error, else returns ""
export async function register(name: string, email: string, phone: string, username: string, password: string): Promise<string> {
    if (await Account.findOne({ username: username }).exec()) {
        return "This username is taken.";
    }
    if (await Account.findOne({ email: email }).exec()) {
        return "This email is taken.";
    }
    if (phone && await Account.findOne({ phoneNumber: phone }).exec()) {
        return "This phone number is taken.";
    }

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    const account = new Account({ name: name, email: email, phoneNumber: phone, username: username, passwordHash: hash, role: "user" });
    if (await account.save()) {
        return "";
    } else {
        throw new Error("Error saving account in database.");
    }
};

export async function login(username: string, password: string): Promise<boolean> {
    const account = await Account.findOne({ username: username }).exec();
    return account && bcrypt.compareSync(password, account.passwordHash);
};

export async function userdata(username: string): Promise<object> {
    const account = await Account.findOne({ username: username }).exec();
    return account ? {
        name: account.name, username: username, role: account.role,
        email: account.email, phoneNumber: account.phoneNumber
    } : {};
}
