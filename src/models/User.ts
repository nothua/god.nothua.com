import { Document, Schema, model } from "mongoose";

export enum Role {
      "Admin" = "admin",
      "User" = "user",
}

const schema = new Schema({
      name: String,
      username: String,
      password: String,
      revoked: {
            type: Boolean,
            default: false,
      },
      role: {
            type: String,
            enum: Role,
            default: Role.User,
      },
});

export default model<Document>("User", schema);
