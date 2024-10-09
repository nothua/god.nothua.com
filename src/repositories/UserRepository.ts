import User from "../models/User";
import BaseRepository from "../classes/BaseRepository";
import type { Document } from "mongoose";

class UserRepository extends BaseRepository<Document> {
      constructor() {
            super(User);
      }

      async toggleAccess(id: string): Promise<String | null> {
            const user = (await this.model.findById(id)) as any;

            if (user == null) {
                  console.log("User doesn't exist");
                  throw new Error("User doesn't exist");
            }

            const status = user.revoked ? "grant" : "revoke";
            user.revoked = !user.revoked;

            try {
                  await this.model.updateOne({ _id: id }, user);
            } catch (error) {
                  console.log(`Error ${status}ing access`, error);
                  throw new Error(`Couldn't ${status} access`);
            }

            return user.revoked ? "revoked" : "granted";
      }
}

export default UserRepository;
