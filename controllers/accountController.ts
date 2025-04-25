import { Request, Response } from 'express';
import { sendEmail } from '../services/mailer';
import {
	register as serviceRegister,
	login as serviceLogin,
	userdata as serviceUserdata,
	deleteAccount as serviceDelete,
	getAccounts as serviceGetAccounts,
	updateGeneralUserData as serviceUpdateUserData,
	updateAccountsRole as serviceUpdateAccountsRole,
	deleteAccounts as serviceDeleteAccounts,
	updateProfileImage as serviceUpdateProfileImage,
	removeProfileImage as serviceRemoveProfileImage,
	repairProfileImageSource as serviceRepairProfileImageSource,
	changePassword as serviceChangePassword,
	changeUsername as serviceChangeUsername
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
		// Send welcome email after successful registration
		await sendEmail(
			email,
			'Welcome to OOCAA!',
			`
			  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background-color: #f9f9f9;">
				<h2 style="color: #0057a8;">Hi ${name || username},</h2>
		  
				<p style="font-size: 16px; color: #333;">
				  Welcome to the <strong style="color: #6870fa;">On-Orbit Collision Avoidance Assistant (OOCAA)</strong> platform!
				</p>
		  
				<p style="font-size: 16px; color: #333;">
				  You can now:
				</p>
		  
				<ul style="font-size: 16px; padding-left: 20px; color: #444;">
				  <li><strong>Create satellite watchlists</strong> to monitor specific objects</li>
				  <li><strong>Subscribe to custom conjunction filters</strong></li>
				  <li><strong>Receive real-time alerts</strong> when threats are detected</li>
				</ul>
		  
				<p style="font-size: 16px; color: #333;">
				  Thanks for joining us on our mission to keep space safe. 🛰️
				</p>
		  
				<div style="margin-top: 30px; text-align: center;">
				  <a href="http://localhost:3001/dashboard" style="background-color: #6870fa; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
					 Go to Dashboard
				  </a>
				</div>
		  
				<p style="margin-top: 40px; font-size: 14px; color: #888;">
				  — The OOCAA Team<br />
				  Keeping space safe, one alert at a time.
				</p>
			  </div>
			`
		  );
		  

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
	const { usernameOrEmail, password } = req.body;
	try {
		const {success, username} = await serviceLogin(usernameOrEmail, password);
        
        if (!success || !username) {
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
        _id,
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
			_id,
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
	const { token, newName, newEmail, newPhone } = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username } = jwt.verify(token, secret) as JwtPayload;
		const result = await serviceUpdateUserData(username, newName, newEmail, newPhone);
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /updateGeneralUserData" });
	}
}

export async function deleteOwnAccount(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const { token } = req.body;
	try {
		if(!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
		const { username } = jwt.verify(token, secret) as JwtPayload;
		const success = await serviceDelete(username);
		res.status(200).json({ success: success });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /login" });
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
export async function changePassword(req: Request, res: Response) {
    const secret = process.env.JWT_SECRET_KEY;
    const { token, currentPassword, newPassword } = req.body;
    
    try {
        if (!secret) throw new Error("JWT_SECRET_KEY is not set");
        const { username } = jwt.verify(token, secret) as JwtPayload;
        
        const result = await serviceChangePassword(username, currentPassword, newPassword);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                token: newAccessToken(username)
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error(error);
		res.status(500).json({ message: "Invalid" });
    }
}
export async function changeUsername(req: Request, res: Response) {
    const secret = process.env.JWT_SECRET_KEY;
    const { token, newUsername } = req.body; 
    if (!secret) {
         console.error("JWT_SECRET_KEY is not set"); 
         return res.status(500).json({ message: "Server configuration error" }); 
    }

    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Malformed token received on backend:', token);
        return res.status(400).json({ success: false, message: "Malformed token received." });
    }

    try { 
        const decoded = jwt.verify(token, secret) as JwtPayload; 
        const currentUsername = decoded.username;

        const result = await serviceChangeUsername(currentUsername, newUsername); 

        if (result.success) { 
            const newToken = newAccessToken(newUsername); 
            res.status(200).json({  
                success: true,
                message: result.message,
                token: newToken
            });
        } else {
            res.status(400).json(result); 
        }
    } catch (error) {
         if (error instanceof jwt.JsonWebTokenError) {
            console.error("JWT Error:", error.message);
            return res.status(401).json({ success: false, message: `Authentication Error: ${error.message}` });
         }
         console.error("Error during username change:", error);
         return res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
}

