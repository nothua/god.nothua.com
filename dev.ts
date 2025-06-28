require("dotenv");

import Mongoose from "mongoose";
import { registerServicesFromDirectory } from "./src/utils";
import { updateDailyWinrate } from "./scripts/fetchDailyWinrate";
import { fetchEmblems, fetchTalents, updateEmblems, updateTalents } from "./scripts/fetchThingies";

Mongoose.connect(process.env.MONGO_URI || "");

registerServicesFromDirectory().then(async () => {
  await updateTalents();
})
