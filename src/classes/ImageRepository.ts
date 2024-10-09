import { Binary } from "mongodb";
import { Octokit } from "octokit";

const githubRepository = "cdn";
const projectDirectory = "god";
const githubTOKEN = "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";
const baseBranch = "main";

export class ImageRepository {
      private static instance: ImageRepository;
      private constructor() {}

      static getInstance() {
            if (!ImageRepository.instance) {
                  ImageRepository.instance = new ImageRepository();
            }
            return ImageRepository.instance;
      }

      private batchImages = new Map<string, Binary>();

      async addImage(imagePath: string, image: Binary) {
            this.batchImages.set(imagePath, image);

            return `https://cdn.nothua.com/${projectDirectory}/${imagePath}`;
      }

      async startTransaction() {
            const octokit = new Octokit({
                  auth: githubTOKEN,
            });

            if (this.batchImages.size === 0) {
                  throw new Error("No images to upload.");
            }

            const message = `Upload ${this.batchImages.size} images`;
            const files: { path: string; content: string }[] = [];

            for (const [imagePath, image] of this.batchImages) {
                  const content = Buffer.isBuffer(image.buffer)
                        ? image.buffer.toString("base64")
                        : Buffer.from(image.buffer).toString("base64");
                  files.push({
                        path: `${projectDirectory}/${imagePath}`,
                        content,
                  });
            }

            try {
                  const {
                        data: {
                              object: { sha: baseBranchSha },
                        },
                  } = await octokit.rest.git.getRef({
                        owner: "nothua",
                        repo: githubRepository,
                        ref: `heads/${baseBranch}`,
                  });

                  const tree = [];
                  for (const file of files) {
                        console.log(`Uploading ${file.path}`);
                        const {
                              data: { sha: blobSha },
                        } = await octokit.rest.git.createBlob({
                              owner: "nothua",
                              repo: githubRepository,
                              content: file.content,
                              encoding: "base64",
                        });

                        tree.push({
                              path: file.path,
                              mode: "100644" as const,
                              type: "blob" as const,
                              sha: blobSha,
                        });
                  }
                  const {
                        data: { sha: newTreeSha },
                  } = await octokit.rest.git.createTree({
                        owner: "nothua",
                        repo: githubRepository,
                        base_tree: baseBranchSha,
                        tree,
                  });

                  const {
                        data: { sha: newCommitSha },
                  } = await octokit.rest.git.createCommit({
                        owner: "nothua",
                        repo: githubRepository,
                        message,
                        tree: newTreeSha,
                        parents: [baseBranchSha],
                  });

                  await octokit.rest.git.updateRef({
                        owner: "nothua",
                        repo: githubRepository,
                        ref: `heads/${baseBranch}`,
                        sha: newCommitSha,
                  });
            } catch (ex) {
                  console.log(ex);
            } finally {
                  console.log("Transaction completed");
                  this.batchImages.clear();
            }
      }
}
