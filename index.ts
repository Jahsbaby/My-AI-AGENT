import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import {
  getFileChangesInDirectoryTool,
  generateCommitMessageTool,
  writeReviewToMarkdownTool,
} from "./tools";
import { mkdir } from "fs/promises";
import "dotenv/config";

const REVIEW_OUTPUT_DIR = "./reviews";

const codeReviewAgent = async (directory: string) => {
  // Step 1: stream review text
  const result = streamText({
    model: google("models/gemini-2.5-flash"),
    prompt: `Review the code changes in '${directory}' directory, make your reviews and suggestions file by file`,
    system: SYSTEM_PROMPT,
    tools: { getFileChangesInDirectoryTool },
    stopWhen: stepCountIs(10),
  });

  let reviewText = "";
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    reviewText += chunk;
  }

  // Step 2: save review to markdown
  await mkdir(REVIEW_OUTPUT_DIR, { recursive: true });
  const filename = `${REVIEW_OUTPUT_DIR}/code-review-${Date.now()}.md`;
  await writeReviewToMarkdownTool.run({ path: filename, content: reviewText });
  console.log(`\n\nSaved review to ${filename}`);

  // Step 3: generate commit message
  const commitMessage = await generateCommitMessageTool.run({
    diff: reviewText,
  });

  console.log("\nSuggested commit message:\n");
  console.log(commitMessage);
  console.log(`\nTo commit these changes locally, run:
  git -C ${directory} add -A
  git -C ${directory} commit -m "${commitMessage.replace(/"/g, "'")}"
  git -C ${directory} push`);
};

// call the agent
await codeReviewAgent("../my-agent");
