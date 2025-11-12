import mongoose, { Schema, Document } from 'mongoose';

export interface IPosition extends Document {
    key: string;
    name: string;
}

const positionSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
});

export default mongoose.model<IPosition>('Position', positionSchema);
