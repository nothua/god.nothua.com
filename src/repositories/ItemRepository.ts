import Item from '../models/Item';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class ItemRepository extends BaseRepository<Document> {
    constructor() {
        super(Item);
    }

    // Add specific methods for ItemRepository here
}

export default ItemRepository;