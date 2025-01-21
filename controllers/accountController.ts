import { Request, Response } from 'express';
const accountService = require('../services/accountService');

async function register(req: Request, res: Response) {
	const { name, username, password } = req.body;
	try {
		const account = await accountService.register(name, username, password);
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
		res.status(200).json({ success: successful });
	} catch (error) {
		// TODO give a proper message
		res.status(500).json({ message: "ERROR ERROR ERROR" });
	}
}

module.exports = {
	register,
	login
};
