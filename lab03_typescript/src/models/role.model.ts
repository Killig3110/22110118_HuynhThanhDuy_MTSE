import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    key: string;
    name: string;
}

const roleSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
});

export default mongoose.model<IRole>('Role', roleSchema);
