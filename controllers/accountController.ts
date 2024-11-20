import { Request, Response } from 'express';
const accountService = require('../services/accountService');

async function register(req: Request, res: Response) {
	const { username, password } = req.body;
	try {
		const account = await accountService.register(username, password);
		res.status(201).json(account);
	} catch (error) {
		// TODO give a proper message
		res.status(500).json({ message: "ERROR ERROR ERROR" });
	}
}

async function login(req: Request, res: Response) {
	const { username, password } = req.body;
	try {
		const successful = await accountService.login(username, password);
		if (successful) {
			res.status(200).json("Login successful");
		} else {
			res.status(200).json("Login failed");
		}
	} catch (error) {
		// TODO give a proper message
		res.status(500).json({ message: "ERROR ERROR ERROR" });
	}
}

module.exports = {
	register,
	login
};
