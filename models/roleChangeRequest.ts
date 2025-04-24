import mongoose, { InferSchemaType } from 'mongoose';

const roleChangeRequestSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    accountId: { type: String, required: true },
    creationTime: { type: String, required: true },
    newRole: { type: Number, required: true },    
});

export default mongoose.model('RoleChangeRequest', roleChangeRequestSchema);
export type RoleChangeRequestType = InferSchemaType<typeof roleChangeRequestSchema>;
