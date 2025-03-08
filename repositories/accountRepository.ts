import Account, { AccountType } from '../models/account';
import bcrypt from "bcryptjs";
import { parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import cloudinary from '../config/cloudinary';

//Regex for email validation.
//eslint-disable-next-line no-useless-escape
const isEmailFormat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//Function for phone number validation.
const isValidPhoneNumber = (number: string): boolean => {
    const phoneNumber: PhoneNumber | undefined = parsePhoneNumberFromString(`+${number.replace(/\D/g, '')}`);
    if(!(phoneNumber && phoneNumber.isValid())){
        return false;
    }
    return true;
};

//Function for data validation.
export const validateUserData = async (
    account: AccountType,
    newName?: string,
    // newUsername?: string,
    newEmail?: string,
    newPhone?: string
): Promise<{success: boolean; message: string}> => {
    //Check data is new and valid.
    if (newName && newName === account.name) {
        return {success: false, message: "Please enter a new name."};
    }
    
    if (newEmail && newEmail === account.email) {
        return {success: false, message: "Please enter a new email."};
    }    
    if (newEmail && !newEmail.match(isEmailFormat)) {
        return {success: false, message: "Please enter a vailid email."};
    }

    if (newPhone && newPhone === account.phoneNumber) {
        return {success: false, message: "Please enter a new phone number."};
    }
    if (newPhone && !isValidPhoneNumber(newPhone)) {
        return {success: false, message: "Please enter a valid phone number."};
    }

    //Check data uniqueness.
    if (newEmail && await Account.findOne({ email: newEmail }).exec()) {
        return {success: false, message: "This email address is already in use."};
    }
    if (newPhone && await Account.findOne({ phoneNumber: newPhone }).exec()) {
        return {success: false, message: "This phone number is already in use."};
    }

    return {success: true, message: "User data valid."};
};


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

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const account = new Account({ name: name, email: email, phoneNumber: phone, username: username, passwordHash: hash, role: "user" });
    if (await account.save()) {
        return "";
    } else {
        throw new Error("Error saving account in database.");
    }
};

export async function login(username: string, password: string): Promise<boolean> {
    const account = await Account.findOne({ username: username }).exec();
    return account ? bcrypt.compareSync(password, account.passwordHash) : false;
};

export async function userdata(username: string): Promise<object> {
    const account = await Account.findOne({ username: username }).exec();
    return account ? {
        name: account.name,
        username: username,
        role: account.role,
        email: account.email,
        phoneNumber: account.phoneNumber,
        profileImage: account.profileImage,
    } : {};
}

export async function updateGeneralUserData(
    currentUsername: string,
    newName?: string,
    // newUsername?: string,
    newEmail?: string,
    newPhone?: string
): Promise<{success: boolean; message: string}> {
    
    //Check if at least 1 piece of new data was given and cancel data updating if not.
    if(!newName /*&& !newUsername*/ && !newEmail && !newPhone){
        return {success: false, message: "User account update cancelled: no new data was given."};
    }

    //User object to update.
    const account = await Account.findOne({ username: currentUsername }).exec();
    if(!account) return {success: false, message: "User account update cancelled: account with given username could not be found."};

    //Validate data.
    const dataValidation = await validateUserData(account, newName, newEmail, newPhone);
    if(!dataValidation.success) return dataValidation;

    //Updated user account object.
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

export async function updateProfileImage(currentUsername: string, newImage: string): Promise<boolean> {
    
    //User object to update.
    const account = await Account.findOne({ username: currentUsername }).exec();
    if(!account) return false;

    //Upload image.
    const parentFolder = process.env.CLOUDINARY_PARENT_FOLDER;
    const uploadedImage = await cloudinary.uploader.upload(newImage, {
        folder: `${parentFolder}/${account._id}`,
    })

    //Updated user account object.
    const updatedAccount = {
        profileImage: {
            publicId: uploadedImage.public_id,
            url: uploadedImage.secure_url,
        }
    };

    //Update user account.
    const result = await Account.updateOne({ _id: account._id }, updatedAccount).exec()
    if(result.matchedCount > 0 && result.modifiedCount > 0){
        return true;
    }else{
        throw new Error("Error updating account in database.");
    }
};
