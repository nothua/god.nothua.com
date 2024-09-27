import Spell from "../models/Spell";
import BaseRepository from "../classes/BaseRepository";
import type { Document } from "mongoose";

class SpellRepository extends BaseRepository<Document> {
      constructor() {
            super(Spell);
      }

      // Add specific methods for SpellRepository here
}

export default SpellRepository;
