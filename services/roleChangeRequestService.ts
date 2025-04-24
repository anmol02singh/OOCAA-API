import {
    createRoleChangeRequest as repoCreateRoleChangeRequest,
    getRoleChangeRequests as repoGetRoleChangeRequests,
    deleteRoleChangeRequest as repoDeleteRoleChangeRequest,
} from '../repositories/roleChangeRequestRepository';

export const createRoleChangeRequest = async (username: string, creationTime: string, newRole: number): Promise<boolean> => {
    return await repoCreateRoleChangeRequest(username, creationTime, newRole);
}

export const getRoleChangeRequests = async (
    creationTime?: string,
    username?: string,
    name?: string,
    role?: number,
    newRole?: number,
): Promise<object> => {
    return await repoGetRoleChangeRequests(
        creationTime,
        username,
        name,
        role,
        newRole
    );
}

export const deleteRoleChangeRequest = async (_id: string): Promise<boolean> => {
    return await repoDeleteRoleChangeRequest(_id);
}