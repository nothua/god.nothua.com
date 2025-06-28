import { Document, Schema, model } from "mongoose";

const schema = new Schema({
    _id: { type: Number, required: true },
    name: String,
    tier: {
        type: Number,
        enum: [1, 2, 3],
    },
    description: String,
    image: String,
});

export default model<Document>("Talent", schema);
