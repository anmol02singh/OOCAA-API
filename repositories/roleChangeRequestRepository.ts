import mongoose from 'mongoose';
import Account from '../models/account';
import RoleChangeRequest, { RoleChangeRequestType } from '../models/roleChangeRequest';

export const createRoleChangeRequest = async (username: string, creationTime: string, newRole: number): Promise<boolean> => {
    
    //Get the logged in user's account. If it returns null despite the token passing, cancel the creation.
    const account = await Account.findOne({ username: username }).exec();
    if (!account) return false;

    //Check if there's an existing request.
    const changeRequest = await RoleChangeRequest.findOne({ accountId: account._id }).exec();

    //If there's an existing request, update the request, otherwise create a new request from scratch.
    if (changeRequest) {
        const newChangeRequest = {
            accountId: account._id,
            creationTime: creationTime,
            newRole: newRole,
        };

        const result = await RoleChangeRequest.updateOne({ _id: changeRequest._id }, newChangeRequest).exec();
        if (result.matchedCount > 0 && result.modifiedCount > 0) {
            return true;
        } else {
            throw new Error("Error updating role change request in database.");
        }
    } else {
        const newChangeRequest = new RoleChangeRequest({
            accountId: account._id,
            creationTime: creationTime,
            newRole: newRole,
        });

        if (await newChangeRequest.save()) {
            return true;
        } else {
            throw new Error("Error saving role change request in database.");
        }
    }
}

export const getRoleChangeRequests = async (
    creationTime?: string,
    username?: string,
    name?: string,
    role?: number,
    newRole?: number,
): Promise<object> => {

    // Get role change requests matching given creation time and new role search params.
    let roleChangeRequests: RoleChangeRequestType[] = [];
    const roleReqParameters = Object.fromEntries(
        Object.entries({
            creationTime: { $regex: creationTime, $options: "i" },
            newRole,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }).filter(([key, value]) =>
            !(value === undefined
                || ((typeof value !== 'number' && typeof value !== 'string')
                    && (value.$regex === undefined))
            )
        )
    );

    roleChangeRequests = [...(await RoleChangeRequest.find(roleReqParameters).exec())];

    // Remove the requests that belong to accounts that don't match the given username, name,
    // and role search params.
    if (username || name || role) {
        roleChangeRequests = (
            await Promise.all(
                roleChangeRequests.map(async (roleReq) => {
                    const accountParameters = Object.fromEntries(
                        Object.entries({
                            _id: roleReq.accountId
                                ? new mongoose.Types.ObjectId(roleReq.accountId)
                                : roleReq.accountId,
                            name: name === "" ? name : { $regex: name, $options: "i" },
                            username: { $regex: username, $options: "i" },
                            role,
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        }).filter(([key, value]) =>
                            !(value === undefined
                                || ((typeof value !== "number" && typeof value !== "string" && !(value instanceof mongoose.Types.ObjectId))
                                    && value?.$regex === undefined)
                            )
                        )
                    );

                    const account = await Account.findOne(accountParameters).exec();
                    return account ? roleReq : null;
                })
            )
        ).filter((roleReq) => roleReq !== null);
    }

    return roleChangeRequests;
}

export const deleteRoleChangeRequest = async (_id: string): Promise<boolean> => {

    //Delete role change request object.
    const result = await RoleChangeRequest.deleteMany({ _id: _id }).exec()
    if (result.deletedCount > 0) {
        return true;
    } else {
        throw new Error("Error deleting role change request in database.");
    }
}