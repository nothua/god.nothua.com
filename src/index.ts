require("dotenv").config({ path: `.env` });
import "reflect-metadata";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import cookieParser from "cookie-parser";
import Mongoose from "mongoose";
import { registerServicesFromDirectory, sendWebhookNotification } from "./utils";

const app = express();

app.set("view engine", "pug");
app.set("views", "./src/views");
app.use("", express.static("./src/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

import { checkBodyMiddleware } from "./middlewares/checkBody";
app.use(checkBodyMiddleware);

import indexRouter from "./routes/IndexRoute";
app.use("/", indexRouter);

import dashRouter from "./routes/DashRoute";
app.use("/dash", dashRouter);

import apiRouter from "./routes/APIRoute";
app.use("/api", apiRouter);

app.use((req, res, next) => {
    res.render("_error", {
        title: "404",
        message: "Page not found",
    });
});

try {
    Mongoose.connect(process.env.MONGO_URI || "");

    Mongoose.connection.on("connected", () => {
        console.log("Connected to MongoDB");
    });

    Mongoose.connection.on("disconnected", () => {
        console.log("Disconnected from MongoDB");
    });

    registerServicesFromDirectory();
} catch (e) {
    console.log(e);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`);
});
