import Talent from "../models/Talent";
import BaseRepository from "../classes/BaseRepository";
import type { Document } from "mongoose";

class TalentRepository extends BaseRepository<Document> {
      constructor() {
            super(Talent);
      }

      // Add specific methods for TalentRepository here1
}

export default TalentRepository;
