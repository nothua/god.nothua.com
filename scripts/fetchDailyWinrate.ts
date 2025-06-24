import { writeFileSync } from "fs";
import {
    HERO_WINRATE_AND_COUNTERS,
    HERO_COMPATIBILITY,
    HEROES,
} from "../src/urls";
import { getServiceLocator } from "../src/utils";
import { RANK, Relation } from "../src/models/Stat";
import type StatRepository from "../src/repositories/StatRepository";
import axios from "axios";
import { getHeroesCount } from "./fetchHeroes";

type RankKey = keyof typeof RANK;

const RANKS: { [key in RankKey]: string } = {
    All: "101",
    Epic: "5",
    Legend: "6",
    Mythic: "7",
    MythicHonor: "8",
    MythicGlory: "9",
};

const serviceLocator = getServiceLocator();

async function fetchData(url: string, rank: string, date: any = null) {

    const req = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            pageSize: await getHeroesCount(),
            filters: [
                {
                    field: "bigrank",
                    operator: "eq",
                    value: RANKS[rank as RankKey],
                },
                { field: "match_type", operator: "eq", value: "0" },
                // {
                //     field: "date",
                //     operator: "lte",
                //     value: date ? date.getTime() : null,
                // },
            ],
            sorts: [
                {
                    data: { field: "main_heroid", order: "asc" },
                    type: "sequence",
                },
            ],
            pageIndex: 1,
            fields: [
                "main_heroid",
                "main_hero_appearance_rate",
                "main_hero_ban_rate",
                "main_hero_win_rate",
                "data.sub_hero.heroid",
                "data.sub_hero.increase_win_rate",
                "data.sub_hero_last.heroid",
                "data.sub_hero_last.increase_win_rate",
            ],
        }),
        headers: [
            ["Content-Type", "application/json"],
            [
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            ],
        ],
    });

    return await req.json();
}

export async function fetchDailyWinrate(date: any) {
    const heroes: any[] = [];
    const ranks: { [key: string]: any } = {
        All: [],
        Epic: [],
        Legend: [],
        Mythic: [],
        MythicHonor: [],
        MythicGlory: [],
    };

    for (const rank in RANKS) {
        const winrate_and_counters_request = await fetchData(
            HERO_WINRATE_AND_COUNTERS(),
            rank,
            date
        );
        const hero_compatibility_request = await fetchData(
            HERO_COMPATIBILITY(),
            rank
        );

        const winrate_and_counters =
            winrate_and_counters_request.data.records;
        const hero_compatibilities =
            hero_compatibility_request.data.records;

        winrate_and_counters.forEach((hero_data: any, i: any) => {
            const hero_compatibility = hero_compatibilities[i].data;

            const hero = {
                heroid: hero_data.data.main_heroid,
                pickrate: hero_data.data.main_hero_appearance_rate * 100,
                winrate: hero_data.data.main_hero_win_rate * 100,
                banrate: hero_data.data.main_hero_ban_rate * 100,
                counteredby: hero_data.data.sub_hero_last.map((data: any) => ({
                    heroid: data.heroid,
                    winrate: data.increase_win_rate * 100,
                    type: "counteredby",
                })),
                counters: hero_data.data.sub_hero.map((data: any) => ({
                    heroid: data.heroid,
                    winrate: data.increase_win_rate * 100,
                    type: "counters",
                })),
                compatabilities: [
                    ...hero_compatibility.sub_hero.map((data: any) => ({
                        heroid: data.heroid,
                        winrate: data.increase_win_rate * 100,
                        type: "counters",
                    })),
                    ...hero_compatibility.sub_hero_last.map((data: any) => ({
                        heroid: data.heroid,
                        winrate: data.increase_win_rate * 100,
                        type: "counteredby",
                    })),
                ],
            };

            ranks[rank as RankKey].push(hero);
        });
    }

    if (date == null) date = new Date();
    else date = new Date(date);
    date.setHours(0, 0, 0, 0);

    for (const rank in RANKS) {
        for (const heroData of ranks[rank]) {
            let existingHero = heroes.find(
                (h) => h.hero === heroData.heroid
            ) || {
                hero: heroData.heroid,
                ranks: [],
                date: date.getTime(),
            };

            if (!heroes.includes(existingHero)) {
                heroes.push(existingHero);
            }

            const relations = [
                ...heroData.counteredby.map((counter: any) => ({
                    hero: parseInt(counter.heroid),
                    type: Relation.CounteredBy,
                    winrate: counter.winrate,
                })),
                ...heroData.counters.map((counter: any) => ({
                    hero: parseInt(counter.heroid),
                    type: Relation.Counters,
                    winrate: counter.winrate,
                })),
                ...heroData.compatabilities.map((comp: any) => ({
                    hero: parseInt(comp.heroid),
                    type: Relation.Compatability,
                    winrate: comp.winrate,
                })),
            ];

            existingHero.ranks.push({
                rank: RANK[rank as RankKey],
                pickrate: heroData.pickrate,
                winrate: heroData.winrate,
                banrate: heroData.banrate,
                relations: relations,
            });
        }
    }

    return heroes;
}

export async function updateDailyWinrate(date: any = null) {
    try {
        const heroes = await fetchDailyWinrate(date);
        const statRepo =
            serviceLocator.resolve<StatRepository>("StatRepository");

        for (const hero of heroes) {
            try {
                await statRepo.create(hero);
                console.log(`Updating hero ${hero.hero} ${hero.date}`);
            } catch (ex) {
                console.error("Error creating hero:", ex);
            }
        }

        sendWebhookNotification("Daily winrate updated successfully");
    } catch (ex: any) {
        console.log("Error updating daily winrate:", ex);
        sendWebhookNotification("Error updating daily winrate", ex.message);
    }
}

const DISCORD_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1313334273268387910/BSTUfOtNpxAJBR9l5B5s6_pa_44-Jxj_7UowNQiXUjR3MEccgc7u6fMYaxa65RnHl4No";

async function sendWebhookNotification(message: string, error?: any) {
    if (!DISCORD_WEBHOOK_URL) {
        console.error("Discord webhook URL not configured");
        return;
    }

    try {
        var _msg = ""
        if(error)
            _msg = `🚨 **Error** 🚨\n\n**Message:** ${message}\n**Error Details:** \`\`\`${
                    error?.message || "Unknown error"
                }\`\`\``;
        else
            _msg = `🚨 **Success** 🚨\n\n**Message:** ${message}`;

        const req = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: [
                ["Content-Type", "application/json"],
                [
                    "User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
                ],
            ],
            body: JSON.stringify({
                content: _msg,
                username: "Moomers",
            })
        });

        console.log(await req.json())
    } catch (webhookError) {
        console.error("Failed to send webhook notification:", webhookError);
    }
}
