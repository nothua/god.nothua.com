import Hero from "../models/Hero";
import BaseRepository from "../classes/BaseRepository";
import Stat, { RANK, RANGE } from "../models/Stat";
import type { Document } from "mongoose";
import mongoose from "mongoose";

class HeroRepository extends BaseRepository<Document> {
    constructor() {
        super(Hero);
    }

    async getHeroStats(rank: string, dateRange: number) {
        try {
            const normalizedRank = rank.toLowerCase();
            const dateThreshold = Date.now() - dateRange * 24 * 60 * 60 * 1000;

            // Aggregation pipeline to calculate accurate averages
            const heroStats = await Stat.aggregate([
                // Filter stats within date range
                {
                    $match: {
                        date: { $gte: dateThreshold },
                    },
                },
                // Unwind ranks to handle multiple ranks per stat
                { $unwind: "$ranks" },
                // Filter for specific rank or "All" rank
                {
                    $match: {
                        $or: [
                            {
                                "ranks.rank": {
                                    $regex: new RegExp(
                                        `^${normalizedRank}$`,
                                        "i"
                                    ),
                                },
                            },
                            { "ranks.rank": { $regex: /^all$/i } },
                        ],
                    },
                },
                // Group by hero to calculate true averages
                {
                    $group: {
                        _id: "$hero",
                        winrates: { $push: "$ranks.winrate" },
                        pickrates: { $push: "$ranks.pickrate" },
                        banrates: { $push: "$ranks.banrate" },
                        count: { $sum: 1 },
                    },
                },
                // Calculate precise averages
                {
                    $project: {
                        hero: "$_id",
                        winrate: {
                            $avg: "$winrates",
                        },
                        pickrate: {
                            $avg: "$pickrates",
                        },
                        banrate: {
                            $avg: "$banrates",
                        },
                        dataPoints: "$count",
                    },
                },
                // Lookup hero details
                {
                    $lookup: {
                        from: "heros", // Ensure this matches your heroes collection name
                        localField: "hero",
                        foreignField: "_id",
                        as: "heroDetails",
                    },
                },
                // Unwind hero details
                {
                    $unwind: {
                        path: "$heroDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                // Final projection with hero details
                {
                    $project: {
                        hero: 1,
                        heroName: {
                            $ifNull: ["$heroDetails.name", "Unknown Hero"],
                        },
                        heroAvatar: {
                            $ifNull: [
                                "$heroDetails.thumbnail",
                                "/default-avatar.png",
                            ],
                        },
                        winrate: {
                            $round: ["$winrate", 2],
                        },
                        pickrate: {
                            $round: ["$pickrate", 2],
                        },
                        banrate: {
                            $round: ["$banrate", 2],
                        },
                        dataPoints: 1,
                    },
                },
                // Sort by winrate descending
                {
                    $sort: { winrate: -1 },
                },
            ]).exec();

            // Ensure default values and type safety
            return heroStats.map((stat: any) => ({
                id: stat.hero,
                name: stat.heroName || `Hero ${stat.hero}`,
                avatar: stat.heroAvatar || `/default-hero-avatar.png`,
                winrate: stat.winrate || 0,
                pickrate: stat.pickrate || 0,
                banrate: stat.banrate || 0,
                dataPoints: stat.dataPoints || 0,
            }));
        } catch (error) {
            console.error("Error in getHeroStats:", error);
            throw error;
        }
    }
}

export default HeroRepository;
