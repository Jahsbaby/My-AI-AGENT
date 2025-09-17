import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";
import { generateText } from "ai";
import { writeFile } from "fs/promises";
import { google } from "@ai-sdk/google";

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>;

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

/**
 * Use the model to generate a concise commit message from a diff.
 */
export const generateCommitMessageTool = {
  name: "generateCommitMessageTool",
  description: "Generate a concise commit message from a git diff",
  inputSchema: z.object({ diff: z.string() }),
  run: async ({ diff }: { diff: string }) => {
    if (!diff || diff.trim().length === 0) return "No changes to commit";

    const prompt = `
You are a git commit message generator. Given a git diff below, produce a single
concise commit message that summarizes the changes in imperative tense.
- Keep the subject <= 50 characters.
- Optionally include a brief body (one or two lines).
Diff:
${diff}
`;
    const { text } = await generateText({
      model: google("models/gemini-2.5-flash"),
      system: "You generate concise commit messages.",
      prompt,
    });
    return text.trim();
  },
};

/**
 * Write review text to a markdown file.
 */
export const writeReviewToMarkdownTool = {
  name: "writeReviewToMarkdownTool",
  description: "Write review content to a markdown file path",
  inputSchema: z.object({ path: z.string(), content: z.string() }),
  run: async ({ path, content }: { path: string; content: string }) => {
    await writeFile(path, content, { encoding: "utf8" });
    return `WROTE:${path}`;
  },
};
