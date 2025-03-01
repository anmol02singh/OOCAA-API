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

export async function updateGeneralUserData(
    currentUsername: string,
    newName?: string,
    // newUsername?: string,
    newEmail?: string,
    newPhone?: string
): Promise<{success: boolean; message: string}> {
    
    if(!newName /*&& !newUsername*/ && !newEmail && !newPhone){
        return {success: false, message: "User account update cancelled: no new data was given."};
    }
    
    // if (newUsername && await Account.findOne({ username: newUsername }).exec()) {
    //     return {success: false, message: "This username is taken."};
    // }
    if (newEmail && await Account.findOne({ email: newEmail }).exec()) {
        return {success: false, message: "This email is taken."};
    }
    if (newPhone && await Account.findOne({ phoneNumber: newPhone }).exec()) {
        return {success: false, message: "This phone number is taken."};
    }

    //User object to update.
    const account = await Account.findOne({ username: currentUsername }).exec();
    if(!account) return {success: false, message: "User account update cancelled: account with given username could not be found."};

    //Updated user acount object.
    const updatedAccount = {
        name: newName ? newName : account.name,
        // username: newUsername ? newUsername : account.username,
        email: newEmail ? newEmail : account.email,
        phoneNumber: newPhone ? newPhone : account.phoneNumber,
    };

    const result = await Account.updateOne({ _id: account._id }, updatedAccount).exec()
    if(result.matchedCount > 0 && result.modifiedCount > 0){
        return {success: true, message: "User account successfully updated"};
    }else{
        throw new Error("Error updating account in database.");
    }
};
