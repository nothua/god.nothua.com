import { Document, Schema, model } from "mongoose";

const schema = new Schema({
      name: String,
      short_description: String,
      description: String,
      image: String,
      emote: String,
      cooldown: String,
});

export default model<Document>("Spell", schema);
