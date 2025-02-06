import { Request, Response } from 'express';
import { register as serviceRegister } from '../services/accountService';
import { login as serviceLogin } from '../services/accountService';
import { userdata as serviceUserdata } from '../services/accountService';

const jwt = require('jsonwebtoken');

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
	const options = { expiresIn: '2h' };

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
		const { username } = jwt.verify(token, secret);
		const userdata = await serviceUserdata(username);
		res.status(200).json(userdata);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /userdata" });
	}
}
