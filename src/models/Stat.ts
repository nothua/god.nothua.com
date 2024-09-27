import { Document, model, Schema } from "mongoose";

export enum RANK {
      "All" = "all",
      "Epic" = "epic",
      "Legend" = "legend",
      "Mythic" = "mythic",
      "MythicHonor" = "mythic_honor",
      "MythicGlory" = "mythic_glory",
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
            type: Number,
            default: Date.now(),
      },
});

export default model<Document>("Stat", schema);
