import mongoose, { InferSchemaType } from 'mongoose';

const accountSchema = new mongoose.Schema({
    name: { type: String, required: false },
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    role: { type: String, required: true },
    profileImage: {
        publicId: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
});

export default mongoose.model('Account', accountSchema);
export type AccountType = InferSchemaType<typeof accountSchema>;
