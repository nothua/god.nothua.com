require("dotenv");

import Mongoose from "mongoose";
import { registerServicesFromDirectory } from "./src/utils";
import { updateDailyWinrate } from "./scripts/fetchDailyWinrate";

Mongoose.connect(process.env.MONGO_URI || "");

registerServicesFromDirectory().then(async () => {
  await updateDailyWinrate();
})
