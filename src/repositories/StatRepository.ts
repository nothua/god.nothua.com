import Stat, { type SimplifiedHeroTrend, RANGE, RANK } from "../models/Stat";
import BaseRepository from "../classes/BaseRepository";
import type { Document } from "mongoose";


class StatRepository extends BaseRepository<Document> {
    constructor() {
        super(Stat);
    }

    //get latest stat update
    async getLatest() {
        return await this.model.findOne().sort({ date: -1 });
    }

    async getMissingDates() {
        const stats = await this.model.find({ hero: 1 }).sort({ date: 1 });

        const dates = stats.map((stat: any) => {
            const date = new Date(stat.date);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        });

        const missingDates = [];
        for (let i = 0; i < dates.length - 1; i++) {
            const diff = dates[i + 1] - dates[i];
            if (diff > 24 * 60 * 60 * 1000) {
                const missingDate = new Date(dates[i]);
                missingDate.setDate(missingDate.getDate() + 1);
                missingDates.push(missingDate);
            }
        }
        return missingDates;
    }

    async getHeroTrend(heroId: String, rank: RANK, range: RANGE): Promise<SimplifiedHeroTrend[]> {
        const endDate = Date.now();
        const startDate = endDate - (range * 24 * 60 * 60 * 1000);

        const trendData = await this.model.find({
            hero: heroId,
            date: { $gte: startDate, $lte: endDate },
            'ranks': {
                $elemMatch: {
                    rank: rank
                }
            }
        }).sort({ date: 1 })
            .lean<any[]>();

        const simplifiedTrendData: SimplifiedHeroTrend[] = trendData.map((statEntry: any) => {
            const rankData = statEntry.ranks.find((r: any) => r.rank === rank);

            return {
                hero: statEntry.hero,
                date: statEntry.date,
                pickrate: rankData ? rankData.pickrate : 0,
                winrate: rankData ? rankData.winrate : 0,
                banrate: rankData ? rankData.banrate : 0,
                relations: rankData ? rankData.relations : []
            };
        });

        return simplifiedTrendData;
    }
}

export default StatRepository;
