import { Document, Schema, model } from "mongoose";

const schema = new Schema({
    hero:
    {
        item: {
            type: Number,
            ref: "Hero",
        },
    },
    time: String,
    start: String,
    talents: [
        {
            talent: {
                type: Number,
                ref: "Talent",
            },
        },
    ],
    emblem: {
        type: Number,
        ref: "Emblem",
    },
});

export default model<Document>("JungleSpeed", schema);
