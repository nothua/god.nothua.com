import { Document, model, Schema } from "mongoose";

export enum RANK {
    "All" = "all",
    "Epic" = "epic",
    "Legend" = "legend",
    "Mythic" = "mythic",
    "MythicHonor" = "mythic_honor",
    "MythicGlory" = "mythic_glory",
}

export enum RANGE {
    "Monthly" = 30,
    "Half-Monthly" = 15,
    "Weekly" = 7,
    "Daily" = 1,
}

export enum Relation {
    "CounteredBy" = "countered_by",
    "Counters" = "counters",
    "Compatability" = "compatability",
}

const schema = new Schema({
    hero: {
        type: Number,
        ref: "Hero",
    },
    ranks: [
        {
            pickrate: Number,
            winrate: Number,
            banrate: Number,
            rank: {
                type: String,
                enum: RANK,
                default: RANK.All,
            },
            relations: [
                {
                    hero: {
                        type: Number,
                        ref: "Hero",
                    },
                    type: {
                        type: String,
                        enum: Relation,
                    },
                    winrate: Number,
                },
            ],
        },
    ],
    date: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export interface SimplifiedHeroTrend {
    hero: number;
    date: String;
    pickrate: number;
    winrate: number;
    banrate: number;
    relations: Array<{
        hero: number;
        type: Relation;
        winrate: number;
    }>;
}

export default model<Document>("Stat", schema);
