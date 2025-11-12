import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    address?: string;
    phoneNumber?: string;
    gender?: boolean;
    image?: string;
    roleId?: string;
    positionId?: string;
}

const userSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        address: { type: String },
        phoneNumber: { type: String },
        gender: { type: Boolean, default: true },
        image: { type: String },
        roleId: { type: String, default: 'R1' },
        positionId: { type: String, default: 'P0' },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
