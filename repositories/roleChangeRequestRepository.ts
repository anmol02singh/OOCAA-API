import Account from '../models/account';
import RoleChangeRequest, { RoleChangeRequestType } from '../models/roleChangeRequest';

export const createRoleChangeRequest = async (username: string, creationTime: string, newRole: number): Promise<boolean> => {
    //Get the logged in user's account. If it returns null despute the token passing, cancel the creation.
    const account = await Account.findOne({ username: username }).exec();
    if (!account) return false;

    const newChangeRequest = new RoleChangeRequest({
        accountId: account._id,
        creationTime: creationTime,
        newRole: newRole,
    });

    //Check if there's an existing request.
    const changeRequest = await RoleChangeRequest.findOne({ accountId: account._id }).exec();

    //If there's an existing request, update the request, otherwise create a new request from scratch.
    if (changeRequest) {
        const result = await RoleChangeRequest.updateOne({ id: changeRequest.id }, newChangeRequest).exec();
        if (result.matchedCount > 0 && result.modifiedCount > 0) {
            return true;
        } else {
            throw new Error("Error updating role change request in database.");
        }
    } else {
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
    const accountParameters = Object.fromEntries(
        Object.entries({
            name: name === "" ? name : { $regex: name, $options: "i" },
            username: { $regex: username, $options: "i" },
            role,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }).filter(([key, value]) =>
            !(value === undefined
                || ((typeof value !== 'number' && typeof value !== 'string')
                    && (value.$regex === undefined))))
    );

    const accounts = await Account.find(accountParameters).exec();

    let roleChangeRequests: RoleChangeRequestType[] = [];
    let roleReqParameters = {};
    for (const account of accounts) {
        if (!account) continue;

        roleReqParameters = Object.fromEntries(
            Object.entries({
                accountId: { $regex: account._id, $options: "i" },
                creationTime: { $regex: creationTime, $options: "i" },
                newRole,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            }).filter(([key, value]) =>
                !(value === undefined
                    || ((typeof value !== 'number' && typeof value !== 'string')
                        && (value.$regex === undefined))))
        );

        roleChangeRequests = [
            ...roleChangeRequests,
            ...(await RoleChangeRequest.find(roleReqParameters).exec())
        ];
    }

    return roleChangeRequests;
}

export const deleteRoleChangeRequest = async (id: number): Promise<boolean> => {

    //Delete role change request object.
    const result = await RoleChangeRequest.deleteMany({ id: id }).exec()
    if (result.deletedCount > 0) {
        return true;
    } else {
        throw new Error("Error deleting role change request in database.");
    }
}