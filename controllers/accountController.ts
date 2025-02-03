import { Request, Response } from 'express';
const jwt = require('jsonwebtoken');
const accountService = require('../services/accountService');

async function register(req: Request, res: Response) {
	const { name, username, password } = req.body;
	try {
		if (!await accountService.register(name, username, password)) {
			res.status(200).json({ success: false });
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

async function login(req: Request, res: Response) {
	const { username, password } = req.body;
	try {
		if (!await accountService.login(username, password)) {
			res.status(200).json({ success: false });
			return;
		}

		res.status(200).json({ success: true, token: newAccessToken(username) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /login" });
	}
}

async function userdata(req: Request, res: Response) {
	const secret = process.env.JWT_SECRET_KEY;
	const { token } = req.body;
	try {
		const { username } = jwt.verify(token, secret);
		const userdata = await accountService.userdata(username);
		res.status(200).json(userdata);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error at /userdata" });
	}
}

module.exports = {
	register,
	login,
	userdata
};
