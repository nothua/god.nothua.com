import { Document, Schema, model } from "mongoose";

const schema = new Schema({
      name: String,
      image: String,
      emote: String,
      attributes: [
            {
                  name: String,
                  value: String,
            },
      ],
});

export default model<Document>("Emblem", schema);
