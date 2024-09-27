import { Document, Schema, model } from "mongoose";

const schema = new Schema({
      name: String,
      tier: {
            type: Number,
            enum: [1, 2, 3],
      },
      short_description: String,
      description: String,
      image: String,
      emote: String,
      cooldown: String,
});

export default model<Document>("Talent", schema);
