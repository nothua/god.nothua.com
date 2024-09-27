import { Document, Schema, model } from "mongoose";

export enum Type {
      "Roam" = "roam",
      "Jungle" = "jungle",
}

const schema = new Schema({
      name: String,
      description: String,
      image: String,
      emote: String,
      type: {
            type: String,
            enum: Type,
      },
});

export default model<Document>("Blessing", schema);
