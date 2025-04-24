import Account, { AccountType } from '../models/account';
import bcrypt from "bcryptjs";
import { parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import cloudinary from '../config/cloudinary';
import { Document, Types } from 'mongoose';

//Placeholder profile picture.
const placeholderProfileImage = {
    publicId: 'OOCAA/profileImages/placeholderProfileImage_kgpfxm.png',
    url: 'https://res.cloudinary.com/dzdbnoch9/image/upload/v1741495294/placeholderProfileImage_wsa3w8.png',
};

//Regex for validation.
const containsExtraSpaces = /\s+/g;
//eslint-disable-next-line no-useless-escape
const isEmailFormat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const isUsernameFormat = /^[a-zA-Z0-9_.]+$/;
const isPasswordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;


//Function for phone number validation.
const isValidPhoneNumber = (number: string): boolean => {
    const phoneNumber: PhoneNumber | undefined = parsePhoneNumberFromString(`+${number.replace(/\D/g, '')}`);
    if (!(phoneNumber && phoneNumber.isValid())) {
        return false;
    }
    return true;
};

//Function for data validation.
export const validateUserData = async (
    account: AccountType,
    newName?: string,
    newEmail?: string,
    newPhone?: string
): Promise<{ success: boolean; message: string }> => {
    //Check data is new and valid.
    if (newName && newName === account.name) {
        return { success: false, message: "Please enter a new name." };
    }

    if (newEmail && newEmail === account.email) {
        return { success: false, message: "Please enter a new email." };
    }
    if (newEmail && !newEmail.match(isEmailFormat)) {
        return { success: false, message: "Please enter a valid email." };
    }

    if (newPhone && newPhone === account.phoneNumber) {
        return { success: false, message: "Please enter a new phone number." };
    }
    if (newPhone && !isValidPhoneNumber(newPhone)) {
        return { success: false, message: "Please enter a valid phone number." };
    }

    //Check data uniqueness.
    if (newEmail && await Account.findOne({ email: newEmail }).exec()) {
        return { success: false, message: "This email address is already in use." };
    }
    if (newPhone && await Account.findOne({ phoneNumber: newPhone }).exec()) {
        return { success: false, message: "This phone number is already in use." };
    }

    return { success: true, message: "User data valid." };
};


// if an error happens, returns a string containing that error, else returns ""
export async function register(name: string, email: string, phone: string, username: string, password: string): Promise<string> {

    const processedName = name.replace(containsExtraSpaces, ' ').trim();
    const processedEmail = email.toLowerCase().trim();
    const processedUsername = username.replace(containsExtraSpaces, "");
    const processedPassword = password.replace(containsExtraSpaces, "");

    //Check Valid
    if (!processedEmail.match(isEmailFormat)) {
        return "Please enter a valid email.";
    }

    if (phone && !isValidPhoneNumber(phone)) {
        return "Please enter a valid phone number.";
    }

    if (processedUsername.length < 4) {
        return "Username must contain at least 4 characters.";
    }

    if (!processedUsername.match(isUsernameFormat)) {
        return "Username can only contain letters, numbers, underscores, and periods.";
    }

    if (processedPassword.length < 8) {
        return "Password must contain at least 8 characters.";
    }

    if (!processedPassword.match(isPasswordFormat)) {
        return "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.";
    }

    //Check Unique    
    if (await Account.findOne({ email: processedEmail }).exec()) {
        return "This email is already in use.";
    }

    if (phone && await Account.findOne({ phoneNumber: phone }).exec()) {
        return "This phone number is already in use.";
    }

    if (await Account.findOne({ username: processedUsername }).exec()) {
        return "This username is already in use.";
    }

    //Create new account.
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(processedPassword, salt);
    const account = new Account({ name: processedName, email: processedEmail, phoneNumber: phone, username: processedUsername, passwordHash: hash, role: 2 });
    if (await account.save()) {
        return "";
    } else {
        throw new Error("Error saving account in database.");
    }
};

export async function login(usernameOrEmail: string, password: string): Promise<{ success: boolean, username: string | undefined }> {
    let processedUsernameOrEmail = usernameOrEmail.trim();
    const processedPassword = password.replace(containsExtraSpaces, "");

    let account = undefined;
    if (usernameOrEmail.includes("@")) {
        processedUsernameOrEmail = processedUsernameOrEmail.toLowerCase();
        account = await Account.findOne({ email: processedUsernameOrEmail }).exec();
    } else {
        account = await Account.findOne({ username: processedUsernameOrEmail }).exec();
    }

    if (!account) return { success: false, username: undefined };

    await repairProfileImageSource(account.username);
    return { success: bcrypt.compareSync(processedPassword, account.passwordHash), username: account.username };
};

/*
* Deletes the user's profileImage folder in the cloud If profileImage field is missing, and
* Deletes the profileImage field in the user's account if their cloud folder is missing or empty.
*/
let repairRunning = false; //to deal with race conditions.
export async function repairProfileImageSource(username: string): Promise<boolean> {
    if (repairRunning) return false;

    repairRunning = true;

    try {
        const account = await Account.findOne({ username: username }).exec();
        if (!account) return false;

        const folder = `${process.env.CLOUDINARY_PARENT_FOLDER}/${account._id}`;

        //Remove image and corresponding user folder if profileImage field is missing.
        if (!account.profileImage) {
            try {
                await cloudinary.api.delete_resources_by_prefix(folder);
                await cloudinary.api.delete_folder(folder);
                //eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                if ((error.http_code && error.http_code === 420)
                    || (error.error.http_code && error.error.http_code === 420
                    )) {
                    console.error("Error deleting folder:", error);
                    return false;
                } else if ((error.http_code && error.http_code !== 404)
                    || (error.error.http_code && error.error.http_code !== 404
                    )) {
                    console.error("Error deleting folder:", error);
                    throw error;
                }
            }
            return true;
        }

        //Check if folder exists
        let folderMissing = false;
        try {
            await cloudinary.api.sub_folders(folder);
            folderMissing = false;
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.error.http_code === 420) {
                console.error("Error checking folder:", error);
                return false;
            } else if (error.error.http_code === 404) {
                folderMissing = true;
            } else {
                console.error("Error checking folder:", error);
                throw error;
            }
        }

        //Check if folder is empty if it exists.
        let folderEmpty = false;
        if (!folderMissing) {
            const { resources } = await cloudinary.api.resources({
                type: "upload",
                prefix: folder,
                max_results: 1,
            });
            folderEmpty = resources.length <= 0;
        }

        //Delete profileImage field from user account if folder is empty or missing.
        if (folderMissing || folderEmpty) {
            //Also delete folder if folder is empty.
            if (folderEmpty) {
                try {
                    await cloudinary.api.delete_folder(folder);
                    //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    if (error.error.http_code === 420) {
                        console.error("Error deleting folder:", error);
                        return false;
                    } else if (error.error.http_code !== 404) {
                        console.error("Error deleting folder:", error);
                        throw error;
                    }
                }
            }

            const result = await Account.updateOne({ _id: account._id }, { $unset: { profileImage: 1 } }).exec()
            if (result.matchedCount > 0 && result.modifiedCount > 0) {
                return true;
            } else {
                console.log(result);
                throw new Error("Error updating account in database.");
            }
        }
    } catch (err) {
        console.error('Error executing profile image source repair:', err);
        return false;
    } finally {
        repairRunning = false;
    }
    return true;
}

//Deletes all cloudinary folders with no corresponding account.
let cleanRunning = false;
export async function cleanCloudinary(): Promise<boolean> {
    if (cleanRunning) return false;

    cleanRunning = true;

    try {
        const parentFolder = `${process.env.CLOUDINARY_PARENT_FOLDER}`;

        try {
            const folders = (await cloudinary.api.sub_folders(parentFolder))?.folders;
            if (!folders) return false;

            const accounts = await Account.find({}).exec();
            if (!accounts) return false;

            let loneFolder = true;
            for (const folder of folders) {
                if (!folder) continue;

                loneFolder = true;
                for (const account of accounts) {
                    if (!account) continue;

                    if (`${folder.name}` === `${account._id}`) {
                        loneFolder = false;
                        break;
                    }
                }

                if (loneFolder) {
                    await cloudinary.api.delete_resources_by_prefix(`${folder.path}`);
                    await cloudinary.api.delete_folder(`${folder.path}`);
                }
            };
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.http_code === 420) {
                console.error("Error checking folder:", error);
                return false;
            } else if (error.http_code === 404) {
                console.error("Error checking folder:", error);
                return false;
            } else {
                console.error("Error checking folder:", error);
                throw error;
            }
        }
    } catch (err) {
        console.error('Error executing cloudinary unmatched folder cleanup:', err);
        return false;
    } finally {
        cleanRunning = false;
    }
    return true;
}

export async function userdata(username: string): Promise<object> {
    const account = await Account.findOne({ username: username }).exec();

    return account ? {
        _id: account._id,
        name: account.name,
        username: username,
        role: account.role,
        email: account.email,
        phoneNumber: account.phoneNumber,
        profileImage: account.profileImage ?
            account.profileImage : placeholderProfileImage,
    } : {};
}

export async function getAccounts(
    _id?: string,
    name?: string,
    username?: string,
    role?: number,
    email?: string,
    phoneNumber?: string,
): Promise<object> {
    const parameters = Object.fromEntries(
        Object.entries({
            _id: _id,
            name: name === "" ? name : { $regex: name, $options: "i" },
            username: { $regex: username, $options: "i" },
            role,
            email: { $regex: email, $options: "i" },
            phoneNumber: phoneNumber === "" ? phoneNumber : { $regex: phoneNumber, $options: "i" },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }).filter(([key, value]) =>
            !(value === undefined
                || ((typeof value !== 'number' && typeof value !== 'string')
                    && (value.$regex === undefined))))
    );

    const accounts = await Account.find(parameters).exec();
    return accounts;
}

export async function updateGeneralUserData(
    currentUsername: string,
    newName?: string,
    newEmail?: string,
    newPhone?: string
): Promise<{ success: boolean; message: string }> {

    //Check if at least 1 piece of new data was given and cancel data updating if not.
    if (newName === undefined
        && !newEmail
        && newPhone === undefined
    ) {
        return { success: false, message: "User account update cancelled: no new data was given." };
    }

    //User object to update.
    const account = await Account.findOne({ username: currentUsername }).exec();
    if (!account) return { success: false, message: "User account update cancelled: account with given username could not be found." };

    const processedName = newName ? newName.replace(containsExtraSpaces, ' ').trim() : newName;
    const processedEmail = newEmail ? newEmail.toLowerCase().trim() : newEmail;

    //Validate data.
    const dataValidation = await validateUserData(account, processedName, processedEmail, newPhone);
    if (!dataValidation.success) return dataValidation;

    //Updated user account object.
    const updatedAccount = {
        name: processedName !== undefined ? processedName : account.name,
        email: processedEmail ? processedEmail : account.email,
        phoneNumber: newPhone !== undefined ? newPhone : account.phoneNumber,
    };

    const result = await Account.updateOne({ _id: account._id }, updatedAccount).exec()
    if (result.matchedCount > 0 && result.modifiedCount > 0) {
        return { success: true, message: "User account successfully updated" };
    } else {
        throw new Error("Error updating account in database.");
    }
};

export async function deleteAccount(username: string): Promise<boolean> {
    const result = await Account.deleteMany({ username: username }).exec();
    return result.deletedCount > 0;
}

export async function updateAccountsRole(
    usernames: string,
    role: number,
): Promise<boolean> {

    //Make sure role is between 0 and 2.
    if (role < 0 || role > 2) return false;

    //User objects to update.
    const accounts = await Account.find({ username: { $in: usernames } }).exec();
    if (!accounts) return false;

    //Cancel update if all the current role of all the accounts is the same as the new role.
    if (accounts.filter(account => account.role !== role).length <= 0) return true;

    //Ids of user objects to update.
    const ids = accounts.map(account => account._id);

    //Update role in given accounts.
    const result = await Account.updateMany({ _id: { $in: ids } }, { role: role }).exec()
    if (result.matchedCount > 0 && result.modifiedCount > 0) {
        return true;
    } else {
        throw new Error("Error updating account in database.");
    }
};

export async function deleteAccounts(
    usernames: string,
): Promise<boolean> {

    //User objects to delete.
    const accounts = await Account.find({ username: { $in: usernames } }).exec();
    if (!accounts) return false;

    //For each account, remove cloudinary image and corresponding user folder.
    let folder = '';
    for (const account of accounts) {
        if (!account) continue;

        folder = `${process.env.CLOUDINARY_PARENT_FOLDER}/${account._id}`;
        try {
            await cloudinary.api.delete_resources_by_prefix(folder);
            await cloudinary.api.delete_folder(folder);
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if ((error.http_code && error.http_code === 420)
                || (error.error.http_code && error.error.http_code === 420
                )) {
                console.error("Error deleting folder:", error);
                return false;
            } else if ((error.http_code && error.http_code !== 404)
                || (error.error.http_code && error.error.http_code !== 404
                )) {
                console.error("Error deleting folder:", error);
                throw error;
            }
        }
    }

    //Ids of user objects to delete.
    const ids = accounts.map(account => account._id);

    //Delete account object.
    const result = await Account.deleteMany({ _id: { $in: ids } }).exec()
    if (result.deletedCount > 0) {
        return true;
    } else {
        throw new Error("Error deleting account in database.");
    }
};

export async function updateProfileImage(currentUsername: string, newImage: string): Promise<boolean> {

    //User object to update.
    const account = await Account.findOne({ username: currentUsername }).exec();
    if (!account) return false;

    //Upload image.
    const folder = `${process.env.CLOUDINARY_PARENT_FOLDER}/${account._id}`;
    try {
        await cloudinary.api.delete_resources_by_prefix(folder);
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.http_code === 420) {
            console.error("Error deleting folder:", error);
            return false;
        } else if (error.http_code !== 404) {
            console.error("Error deleting folder:", error);
            throw error;
        }
    }
    const uploadedImage = await cloudinary.uploader.upload(newImage, {
        folder: folder,
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
    if (result.matchedCount > 0 && result.modifiedCount > 0) {
        return true;
    } else {
        console.log(result);
        throw new Error("Error updating account in database.");
    }
};

export async function removeProfileImage(currentUsername: string): Promise<boolean> {

    //User object to remove from.
    const account = await Account.findOne({ username: currentUsername }).exec();
    if (!account) return false;

    //Remove image and corresponding user folder.
    const folder = `${process.env.CLOUDINARY_PARENT_FOLDER}/${account._id}`;
    try {
        await cloudinary.api.delete_resources_by_prefix(folder);
        await cloudinary.api.delete_folder(folder);
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if ((error.http_code && error.http_code === 420)
            || (error.error.http_code && error.error.http_code === 420
            )) {
            console.error("Error deleting folder:", error);
            return false;
        } else if ((error.http_code && error.http_code !== 404)
            || (error.error.http_code && error.error.http_code !== 404
            )) {
            console.error("Error deleting folder:", error);
            throw error;
        }
    }

    //Update user account.
    if (!account.profileImage) return false;
    const result = await Account.updateOne({ _id: account._id }, { $unset: { profileImage: 1 } }).exec()
    if (result.matchedCount > 0 && result.modifiedCount > 0) {
        return true;
    } else {
        console.log(result);
        throw new Error("Error updating account in database.");
    }
};

export const changePassword = async (
    username: string,
    currentPassword: string,
    newPassword: string,

): Promise<boolean> => {
    const account = await Account.findOne({ username }).exec();
    if (!account) throw new Error("User not found");

    // Verify current password
    if (!bcrypt.compareSync(currentPassword, account.passwordHash)) {
        throw new Error("Invalid current password");
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    // Update password
    const result = await Account.updateOne(
        { _id: account._id },
        { $set: { passwordHash: newHash } }
    ).exec();

    return result.modifiedCount === 1;
};

export const changeUsername = async (
    currentUsername: string,
    newUsername: string
): Promise<boolean> => {
    const result = await Account.updateOne(
        { username: currentUsername },
        { $set: { username: newUsername } }
    ).exec();
    const updatedUser = await Account.findOne({ username: newUsername }).exec();
    if (result.matchedCount === 0) {
        throw new Error("User not found");
    }

    return result.modifiedCount === 1;
};

export async function findUserByUsername(username: string): Promise<(AccountType & Document) | null> {
    try {
        const account = await Account.findOne({ username: username }).exec();
        return account;
    } catch (error) {
        console.error(`Error finding user by username:`, error);
        throw new Error(`Database error while searching for username.`);
    }
}
