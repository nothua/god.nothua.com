import User from '../models/User';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class UserRepository extends BaseRepository<Document> {
    constructor() {
        super(User); 
    }

    // Add specific methods for UserRepository here
}

export default UserRepository;