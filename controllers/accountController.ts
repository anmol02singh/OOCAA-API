import { Request, Response } from 'express';
import {
	register as serviceRegister,
	login as serviceLogin,
	userdata as serviceUserdata,
	getAccounts as serviceGetAccounts,
	updateGeneralUserData as serviceUpdateUserData,
    updateAccountsRole as serviceUpdateAccountsRole,
    deleteAccounts as serviceDeleteAccounts,
	updateProfileImage as serviceUpdateProfileImage,
	removeProfileImage as serviceRemoveProfileImage,
	repairProfileImageSource as serviceRepairProfileImageSource,
} from '../services/accountService';
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { AccountType } from '../models/account';

export async function register(req: Request, res: Response) {
	const { name, email, phone, username, password } = req.body;
	try {
		const error = await serviceRegister(name, email, phone, username, password);
		if (error !== "") {
			res.status(200).json({ success: false, error: error });
			return;
		}

		res.status(201).json({ success: true, token: newAccessToken(username) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /register" });
	}
}

function newAccessToken(username: string) {
	const payload = { username: username };
	const secret = process.env.JWT_SECRET_KEY;
	const options: SignOptions = { expiresIn: '2h' };

	if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");

	return jwt.sign(payload, secret, options);
}

export async function login(req: Request, res: Response) {
	const { username, password } = req.body;
	try {
		if (!await serviceLogin(username, password)) {
			res.status(200).json({ success: false });
			return;
		}

		res.status(200).json({ success: true, token: newAccessToken(username) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /login" });
	}
}

export async function userdata(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const { token } = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username } = jwt.verify(token, secret)  as JwtPayload;
		const userdata = await serviceUserdata(username);
		res.status(200).json(userdata);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /userdata" });
	}
}

export async function getAccounts(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const {
		token,
		name,
		username,
		role,
		email,
		phoneNumber,
	} = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username: currentUsername } = jwt.verify(token, secret) as JwtPayload;
		
		//Check requester is an admin.
		const isAdmin = await serviceUserdata(currentUsername)
		.then(json => {
			if((json as AccountType).role < 1){
				return true;
			} else if((json as AccountType).role >= 1) {
				res.status(403).json({ message: "User does not have permission to request /getAllAccounts" });
				return false;
			} else {
                throw new Error("Error parsing json as Account");
			}		
		})
		if(!isAdmin) return;

		//Get and return accounts.
		const accounts  = await serviceGetAccounts(
			name,
			username,
			role,
			email,
			phoneNumber,
		);		
		res.status(200).json(accounts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /userdata" });
	}
}

export async function updateGeneralUserData(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const { token, newName, /*newUsername,*/ newEmail, newPhone } = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username } = jwt.verify(token, secret) as JwtPayload;
		const result = await serviceUpdateUserData(username, newName, /*newUsername,*/ newEmail, newPhone);
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /updateGeneralUserData" });
	}
}

export async function updateAccountsRole(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const {
		token,
		usernames,
        role,
	} = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username: currentUsername } = jwt.verify(token, secret) as JwtPayload;
		
		//Check requester is an admin.
		const isAdmin = await serviceUserdata(currentUsername)
		.then(json => {
			if((json as AccountType).role < 1){
				return true;
			} else if((json as AccountType).role >= 1) {
				res.status(403).json({ message: "User does not have permission to request /updateAccountsRole" });
				return false;
			} else {
                throw new Error("Error parsing json as Account");
			}		
		})
		if(!isAdmin) return;

		//Update accounts.
		const result  = await serviceUpdateAccountsRole(usernames, role);
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /updateAccountsRole" });
	}
}

export async function deleteAccounts(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const {
		token,
		usernames,
	} = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username: currentUsername } = jwt.verify(token, secret) as JwtPayload;
		
		//Check requester is an admin.
		const isAdmin = await serviceUserdata(currentUsername)
		.then(json => {
			if((json as AccountType).role < 1){
				return true;
			} else if((json as AccountType).role >= 1) {
				res.status(403).json({ message: "User does not have permission to request /deleteAccounts" });
				return false;
			} else {
                throw new Error("Error parsing json as Account");
			}		
		})
		if(!isAdmin) return;

		//Delete account.
		const result  = await serviceDeleteAccounts(usernames);
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /deleteAccounts" });
	}
}

export async function updateProfileImage(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const { token, newImage } = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username } = jwt.verify(token, secret) as JwtPayload;
		const result = await serviceUpdateProfileImage(username, newImage);
		
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /updateProfileImage" });
	}
}

export async function removeProfileImage(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const { token } = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username } = jwt.verify(token, secret) as JwtPayload;
		const result = await serviceRemoveProfileImage(username);
		
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /removeProfileImage" });
	}
}

export async function repairProfileImageSource(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const { token } = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username } = jwt.verify(token, secret) as JwtPayload;
		const result = await serviceRepairProfileImageSource(username);
		
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /repairProfileImageSource" });
	}
}
