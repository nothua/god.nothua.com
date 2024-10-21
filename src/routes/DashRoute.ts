import type { Request, Response } from "express";
import { getServiceLocator } from "../utils";
import HeroRepository from "../repositories/HeroRepository";
import { authMiddleware } from "../middlewares/auth";
import type UserRepository from "../repositories/UserRepository";
import {
    Resource,
    RoleType,
    SkillTags,
    SkillType,
    SkinRarity,
} from "../models/Hero";

const router = require("express").Router();

const heroRepo = () => {
    return getServiceLocator().resolve<HeroRepository>("HeroRepository");
};
const userRepo = () => {
    return getServiceLocator().resolve<UserRepository>("UserRepository");
};

router.use(authMiddleware);

const routes = async (req: Request) => {
    const user = (await userRepo().get(req.cookies.userId)) as any;

    let routes = [
        {
            icon: "grid-2",
            name: "Home",
            route: "/dash",
        },
        {
            icon: "helmet-battle",
            name: "Heroes",
            route: "/dash/heroes",
        },
        {
            icon: "swords",
            name: "Items",
            route: "/dash/items",
        },
        {
            icon: "badge",
            name: "Emblems",
            route: "/dash/emblems",
        },
        {
            icon: "hat-witch",
            name: "Talents",
            route: "/dash/talents",
        },
        {
            icon: "sparkles",
            name: "Blessings",
            route: "/dash/blessings",
        },
        {
            icon: "users",
            name: "Users",
            route: "/dash/users",
            role: "admin",
        },
    ];

    return routes.filter((route) => {
        if (!route.role) return true;
        return route.role === user?.role;
    });
};

// List Views

router.get("/", async (req: Request, res: Response) => {
    res.render("dash/index", {
        routes: await routes(req),
        active: "Home",
    });
});

router.get(`/users`, async (req: Request, res: Response) => {
    res.render("dash/users", {
        routes: await routes(req),
        active: "Users",
    });
});

router.get(`/heroes`, async (req: Request, res: Response) => {
    res.render("dash/heroes/index", {
        routes: await routes(req),
        types: RoleType,
        active: "Heroes",
    });
});

router.get(`/hero/:id`, async (req: Request, res: Response) => {
    const { id } = req.params;

    const hero = await heroRepo().get(id);

    const data = JSON.parse(JSON.stringify(hero));

    res.json(data);
});

router.get(`/heroes/edit/:id`, async (req: Request, res: Response) => {
    const { id } = req.params;

    const hero = await heroRepo().get(id);

    const data = JSON.parse(JSON.stringify(hero));

    res.render("dash/heroes/edit", {
        routes: await routes(req),
        roles: RoleType,
        skillTags: SkillTags,
        resources: Resource,
        skinRarity: SkinRarity,
        skillType: SkillType,
        hero: data,
        active: "Heroes",
    });
});

//Fetch List

router.get(`/users/list`, async (req: Request, res: Response) => {
    const users = await userRepo().getAll();

    res.json(
        users
            .filter(
                (user: any) =>
                    user._id.toString() !== req.cookies.userId.toString()
            )
            .map((user: any) => {
                delete user.password;

                return user;
            })
    );
});

router.get(`/heroes/list`, async (req: Request, res: Response) => {
    try {
        const heroes = await heroRepo().getAll();

        let data = heroes
            .map((hero: any) => {
                const data = {
                    _id: hero._id,
                    name: hero.name,
                    role: hero.role,
                    thumbnail: hero.thumbnail,
                };

                return data;
            })
            .sort((a: any, b: any) => {
                if (a._id < b._id) return 1;
                if (a._id > b._id) return -1;
                return 0;
            });

        res.json(data);
    } catch (ex) {
        console.error(ex);
    }
});

//Create

router.post(
    "/users/create",
    authMiddleware,
    async (req: Request, res: Response) => {
        const { name, username, password, role } = req.body;

        if (!name || !username || !password || !role) {
            return res.json({
                success: false,
                message: "Missing fields",
            });
        }

        try {
            await userRepo().create({
                name,
                username,
                password,
                role,
            } as any);

            return res.json({ success: true, message: "User created" });
        } catch (ex) {
            return res.json({
                success: false,
                message: "Couldn't create user",
            });
        }
    }
);

//Update

//Delete

router.delete(
    "/users/delete/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            await userRepo().delete(id);
            return res.json({ success: true, message: "User deleted" });
        } catch (ex) {
            return res.json({
                success: false,
                message: "Couldn't delete user",
            });
        }
    }
);

//Misc

router.get(
    "/users/access/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const access = await userRepo().toggleAccess(id);
            return res.json({
                success: true,
                message: `Access ${access}`,
            });
        } catch (ex) {
            return res.json({
                success: false,
                message: "Couldn't toggle user access",
            });
        }
    }
);

export default router;
