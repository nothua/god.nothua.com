import JungleSpeed from '../models/JungleSpeed';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class JungleSpeedRepository extends BaseRepository<Document> {
    constructor() {
        super(JungleSpeed);
    }

    // Add specific methods for JungleSpeedRepository here

    //populate hero, and emblems
    async getPopulatedData() {
        const data = await this.model
            .find()
            .populate("hero")
            .populate("emblem.emblem");


        return data.map((d: any) => {
            d.hero = {
                name: d.hero.data.name,
                thumbnail: d.hero.data.thumbnail,
            };
            d.emblem = d.emblem.map((e: any) => {
                return {
                    name: e.emblem.data.name,
                    image: e.emblem.data.image,
                };
            });
            return d;
        });
    }
}

export default JungleSpeedRepository;