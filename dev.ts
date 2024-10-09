require("dotenv").config({ path: `.env.development` });
import Mongoose from "mongoose";
import { updateDailyWinrate } from "./scripts/fetchDailyWinrate";
import { registerServicesFromDirectory } from "./src/utils";
import { updateHeroes } from "./scripts/fetchHeroes";
import { createUser } from "./scripts/createUser";

Mongoose.connect(process.env.MONGO_URI || "");
console.log("Mongodb connected");
await registerServicesFromDirectory();
console.log("Repositories loaded");

console.log(
      await createUser({
            name: "Hua",
            username: "nothua",
            password: "nothua",
      })
);
