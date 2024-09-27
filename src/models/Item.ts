import { Document, Schema, model } from "mongoose";

export enum Type {
      "Attack" = "attack",
      "Magic" = "magic",
      "Defense" = "defense",
      "Movement" = "movement",
}

const schema = new Schema({
      name: String,
      image: String,
      emote: String,
      tier: {
            type: Number,
            default: 1,
            enum: [1, 2, 3],
      },
      gold: {
            buy: {
                  type: Number,
                  default: 0,
            },
            sell: {
                  type: Number,
                  default: 0,
            },
            upgrade: {
                  type: Number,
                  default: 0,
            },
      },
      type: {
            type: String,
            enum: Type,
      },
      attributes: [
            {
                  name: String,
                  value: String,
                  unique: Boolean,
            },
      ],
      passives: [
            {
                  name: String,
                  description: String,
                  cooldown: Number,
            },
      ],
      actives: [
            {
                  name: String,
                  description: String,
                  cooldown: Number,
            },
      ],
      build_path: [
            {
                  id: {
                        type: Schema.Types.ObjectId,
                        ref: "Item",
                  },
            },
      ],
});

export default model<Document>("Item", schema);
