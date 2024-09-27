import Emblem from '../models/Emblem';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class EmblemRepository extends BaseRepository<Document> {
    constructor() {
        super(Emblem);
    }

    // Add specific methods for EmblemRepository here
}

export default EmblemRepository;