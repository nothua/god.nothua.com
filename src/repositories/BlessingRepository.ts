import Blessing from '../models/Blessing';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class BlessingRepository extends BaseRepository<Document> {
    constructor() {
        super(Blessing);
    }

    // Add specific methods for BlessingRepository here
}

export default BlessingRepository;