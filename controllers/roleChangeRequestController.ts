import { Request, Response } from 'express';
import {
    createRoleChangeRequest as serviceCreateRoleChangeRequest,
    getRoleChangeRequests as serviceGetRoleChangeRequests,
    deleteRoleChangeRequest as serviceDeleteRoleChangeRequest
} from '../services/roleChangeRequestService';
import { userdata as serviceUserdata } from '../services/accountService';
import jwt, { JwtPayload } from "jsonwebtoken";
import { AccountType } from '../models/account';

export const createRoleChangeRequest = async (req: Request, res: Response) => {
    const secret = process.env.JWT_SECRET_KEY;
    const {
        token,
        creationTime,
        newRole,
    } = req.body;
    try {
        if (!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
        const { username } = jwt.verify(token, secret) as JwtPayload;

        //Create role change request.
        const result = await serviceCreateRoleChangeRequest(username, creationTime, newRole);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error at /create-role-change-request" });
    }
}

export const getRoleChangeRequests = async (req: Request, res: Response) => {
    const secret = process.env.JWT_SECRET_KEY;
    const {
        token,
        creationTime,
        username,
        name,
        role,
        newRole,
    } = req.body;
    try {
        if (!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
        const { username: currentUsername } = jwt.verify(token, secret) as JwtPayload;

        //Check requester is an admin.
        const isAdmin = await serviceUserdata(currentUsername)
            .then(json => {
                if ((json as AccountType).role < 1) {
                    return true;
                } else if ((json as AccountType).role >= 1) {
                    res.status(403).json({ message: "User does not have permission to request /get-role-change-request" });
                    return false;
                } else {
                    throw new Error("Error parsing json as Account");
                }
            })
        if (!isAdmin) return;

        //Get role change requests.
        const result = await serviceGetRoleChangeRequests(
            creationTime,
            username,
            name,
            role,
            newRole,
        );
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error at /get-role-change-request" });
    }
}

export const deleteRoleChangeRequest = async (req: Request, res: Response) => {
    const secret = process.env.JWT_SECRET_KEY;
    const {
        token,
        _id,
    } = req.body;
    try {
        if (!secret) throw new Error("JWT_SECRET_KEY is not set in environment variables");
        const { username } = jwt.verify(token, secret) as JwtPayload;

        //Check requester is an admin.
        const isAdmin = await serviceUserdata(username)
            .then(json => {
                if ((json as AccountType).role < 1) {
                    return true;
                } else if ((json as AccountType).role >= 1) {
                    res.status(403).json({ message: "User does not have permission to request /delete-role-change-request" });
                    return false;
                } else {
                    throw new Error("Error parsing json as Account");
                }
            })
        if (!isAdmin) return;

        //Delete role change request.
        const result = await serviceDeleteRoleChangeRequest(_id);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error at /delete-role-change-request" });
    }
}