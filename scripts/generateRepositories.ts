import { existsSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const modelsPath = join(__dirname, "../src/models");
const repositoriesPath = join(__dirname, "../src/repositories");

if (!readdirSync(repositoriesPath).length) {
      console.log("Creating repositories directory...");
}

const modelFiles = readdirSync(modelsPath).filter((file) =>
      file.endsWith(".ts")
);

modelFiles.forEach((file) => {
      const modelName = file.replace(".ts", "");
      const repositoryContent = ` 
import ${modelName} from '../models/${modelName}';
import BaseRepository from '../classes/BaseRepository';
import type { Document } from "mongoose";

class ${modelName}Repository extends BaseRepository<Document> {
    constructor() {
        super(${modelName}); 
    }

    // Add specific methods for ${modelName}Repository here
}

export default ${modelName}Repository;
`;

      const repositoryFilePath = join(
            repositoriesPath,
            `${modelName}Repository.ts`
      );

      if (existsSync(repositoryFilePath))
            return console.log(`${modelName}Repository already exists`);
      writeFileSync(repositoryFilePath, repositoryContent.trim(), {
            encoding: "utf-8",
      });

      console.log(`Generated repository: ${repositoryFilePath}`);
});
