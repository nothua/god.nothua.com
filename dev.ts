require("dotenv");
import Mongoose from "mongoose";
import { createUser } from "./scripts/createUser";
import { registerServicesFromDirectory } from "./src/utils";
import { fetchHeroes, updateHeroes } from "./scripts/fetchHeroes";

Mongoose.connect(process.env.MONGO_URI || "");
console.log("Mongodb connected");
registerServicesFromDirectory().then(() => {
  createUser({
    name: "admin",
    username: "nothua",
    password: "MLBB_Admin@Guide",
  });
  createUser({
    name: "frei",
    username: "frei",
    password: "MLBB_Guide@2025",
  });
});
