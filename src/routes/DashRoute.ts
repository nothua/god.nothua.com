import type { Request, Response } from "express";
import { getServiceLocator } from "../utils";
import HeroRepository from "../repositories/HeroRepository";

const router = require("express").Router();

const heroRepo = () => {
      getServiceLocator().resolve<HeroRepository>("HeroRepository");
};

const routes = async (req: Request) => {
      // const user = await userRepo.get(req.cookies.userId);

      let routes = [
            {
                  icon: "grid-2",
                  name: "Home",
                  route: "/",
            },
            {
                  icon: "helmet-battle",
                  name: "Heroes",
                  route: "/heroes",
            },
            {
                  icon: "swords",
                  name: "Items",
                  route: "/items",
            },
            {
                  icon: "badge",
                  name: "Emblems",
                  route: "/emblems",
            },
            {
                  icon: "hat-witch",
                  name: "Talents",
                  route: "/talents",
            },
            {
                  icon: "sparkles",
                  name: "Blessings",
                  route: "/blessings",
            },
            {
                  icon: "users",
                  name: "Users",
                  route: "/users",
            },
      ];

      return routes;
      // .filter((route) => {
      //       if (!route.role) return true;
      //       return route.role === user?.role;
      // });
};

router.get("/", async (req: Request, res: Response) => {
      res.render("dash/index", {
            routes: await routes(req),
      });
});

export default router;
