import type { Request, Response } from "express";
import { getServiceLocator } from "../utils";
import { updateDailyWinrate } from "../../scripts/fetchDailyWinrate";
import { updateHero, updateHeroes } from "../../scripts/fetchHeroes";
import { updateEmblems } from "../../scripts/fetchThingies";

const router = require("express").Router();

import type HeroRepository from "../repositories/HeroRepository";
import {
    AttackType,
    HeroSpeciality,
    Position,
    Resource,
    RoleType,
    SkillTags,
    SkillType,
    SkinRarity,
} from "../models/Hero";
import { RANK, RANGE } from "../models/Stat";
import type StatRepository from "../repositories/StatRepository";

const heroRepo = () => {
    return getServiceLocator().resolve<HeroRepository>("HeroRepository");
};
const statRepo = () => {
    return getServiceLocator().resolve<StatRepository>("StatRepository");
};

router.get("/uptime", (req: Request, res: Response) => {
    res.json({
        message: "Uptime",
        time: process.uptime(),
    });
});

router.get("/fetchDailyWinrate", async (req: Request, res: Response) => {
    if (req.query.auth != "nothua")
        return res.json({ message: "Unauthorized" });

    res.json({
        message: "Updating",
        time: Date.now(),
    });

    if (req.query.date) {
        await updateDailyWinrate(new Date(req.query.date.toString()));
        return;
    }

    await updateDailyWinrate();


    res.json({message: "Updated", time: Date.now()});
});

router.post("/fetchHeroes", async (req: Request, res: Response) => {
    if (req.body.auth != "nothua") return res.json({ message: "Unauthorized" });

    res.json({
        message: "Updating",
        time: Date.now(),
    });

    updateHeroes();
});

router.get("/fetchSingleHero", async (req: Request, res: Response) => {
    const { id, auth } = req.query;

    if (auth != "nothua") return res.json({ message: "Unauthorized" });

    res.json({
        message: "Updating",
        time: Date.now(),
    });

    updateHero(Number(id));
});

router.post("/fetchEmblems", async (req: Request, res: Response) => {
    if (req.body.auth != "nothua") return res.json({ message: "Unauthorized" });

    res.json({
        message: "Updating",
        time: Date.now(),
    });

    updateEmblems();
});

router.post("/misc", async (req: Request, res: Response) => {
    let { requestData } = req.body;

    if (!requestData) return res.status(400).json({ message: "failed" });

    requestData = requestData.split(",");

    const data = {} as any;

    if (requestData.includes("roles")) data.roles = RoleType;
    if (requestData.includes("skillTags")) data.skillTags = SkillTags;
    if (requestData.includes("resources")) data.resources = Resource;
    if (requestData.includes("skinRarity")) data.skinRarity = SkinRarity;
    if (requestData.includes("skillType")) data.skillType = SkillType;
    if (requestData.includes("specialities"))
        data.specialities = HeroSpeciality;
    if (requestData.includes("attackTypes")) data.attackTypes = AttackType;
    if (requestData.includes("positions")) data.positions = Position;
    if (requestData.includes("ranks")) {
        data.ranks = Object.keys(RANK)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key.replace(/(?<!\s)[A-Z]/g, " $&"),
                value: RANK[key as keyof typeof RANK],
            }));
    }
    if (requestData.includes("ranges"))
        data.ranges = Object.keys(RANGE)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key,
                value: RANGE[key as keyof typeof RANGE],
            }));

    res.json(data);
});

router.post("/hero-stats", async (req: Request, res: Response) => {
    try {
        const { rank = "All", dateRange } = req.body;

        if (isNaN(parseInt(dateRange)))
            return res.status(400).json({ message: "Invalid date range" });

        const heroStats = await heroRepo().getHeroStats(
            RANK[rank as keyof typeof RANK],
            parseInt(dateRange)
        );

        const processedHeroStats = heroStats.map((stat: any) => {
            const winrate = Number((stat.winrate || 0).toFixed(2));
            const pickrate = Number((stat.pickrate || 0).toFixed(2));
            const banrate = Number((stat.banrate || 0).toFixed(2));

            const trend = Number(
                (winrate * 0.6 + pickrate * 0.3 + banrate * 0.1).toFixed(2)
            );

            return {
                id: stat.id,
                name: stat.name,
                avatar: stat.avatar,
                winrate,
                pickrate,
                banrate,
                trend,
                rank: rank.toLowerCase(),
                dateRange: dateRange,
            };
        });

        processedHeroStats.sort((a, b) => b.winrate - a.winrate);

        res.json(processedHeroStats);
    } catch (error: any) {
        console.error("Failed to fetch hero stats:", error);
        res.status(500).json({
            message: "Failed to fetch hero stats",
            error: error.message,
        });
    }
});

router.get("/hero-stats/latest", async (req: Request, res: Response) => {
    try {
        const stat = await statRepo().getLatest();
        res.json(stat);
    } catch (error: any) {
        console.error("Failed to fetch latest stat:", error);
        res.status(500).json({
            message: "Failed to fetch latest stat",
            error: error.message,
        });
    }
});

router.get("/missing-dates", async (req: Request, res: Response) => {
    res.json(await statRepo().getMissingDates());
});

export default router;
