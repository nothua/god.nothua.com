import { Document, Schema, model } from "mongoose";

const schema = new Schema({
    _id: { type: Number, required: true },
    name: String,
    image: String,
    attributes: [
        {
            name: String,
            value: String,
        },
    ],
});

export default model<Document>("Emblem", schema);
