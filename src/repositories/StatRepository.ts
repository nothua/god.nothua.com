import Stat from '../models/Stat';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class StatRepository extends BaseRepository<Document> {
    constructor() {
        super(Stat); 
    }

    // Add specific methods for StatRepository here
}

export default StatRepository;