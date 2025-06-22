require("dotenv");
import Mongoose from "mongoose";
import { createUser } from "./scripts/createUser";
import { registerServicesFromDirectory } from "./src/utils";
import { fetchHeroes, updateHeroes } from "./scripts/fetchHeroes";

Mongoose.connect(process.env.MONGO_URI || "");
console.log("Mongodb connected");
registerServicesFromDirectory().then(() => {
  updateHeroes();
});
