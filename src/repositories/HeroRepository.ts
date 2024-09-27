import Hero from '../models/Hero';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class HeroRepository extends BaseRepository<Document> {
    constructor() {
        super(Hero);
    }

    // Add specific methods for HeroRepository here
}

export default HeroRepository;