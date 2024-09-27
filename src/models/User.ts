import { Document, Schema, model } from "mongoose";

export enum Role {
      "Admin" = "admin",
      "User" = "user",
}

const schema = new Schema({
      name: String,
      password: String,
      revoked: String,
      role: {
            type: String,
            enum: Role,
            default: Role.User,
      },
});

export default model<Document>("User", schema);
