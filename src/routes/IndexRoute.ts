import type { Request, Response } from "express";
import { comparePassword, getServiceLocator } from "../utils";
import type UserRepository from "../repositories/UserRepository";

const userRepo = () => {
    return getServiceLocator().resolve<UserRepository>("UserRepository");
};

const router = require("express").Router();

router.get("/", (req: Request, res: Response) => {
    res.render("front/index");
});

router.get("/winrates", (req: Request, res: Response) => {
    res.render("front/winrates");
});

router.get("/login", async (req: Request, res: Response) => {
    if (req.cookies.userId) return res.redirect("/");

    res.render("dash/login");
});

router.post("/login", async (req: Request, res: Response) => {
    const user = (await userRepo().getByField(
        "username",
        req.body.username
    )) as any;

    if (!user) {
        return res.render("dash/login", { error: "User doesn't exist" });
    }

    if (user.revoked) {
        return res.render("dash/login", { error: "Access revoked" });
    }

    if (await comparePassword(req.body.password, user.password)) {
        res.cookie("userId", user.id);
        return res.redirect("/dash");
    } else {
        return res.render("dash/login", { error: "Incorrect password" });
    }
});

export default router;
