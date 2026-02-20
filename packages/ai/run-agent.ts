import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const agent = process.argv[2]; // product_owner | developer | tester | finance
const inputFile = process.argv[3];

if (!agent || !inputFile) {
  console.error("Usage: pnpm agent <agent> <input.md>");
  process.exit(1);
}

const agentFile = path.join(
  __dirname,
  "agents",
  `${agent.replace(/_/g, "-")}.txt`
);
const systemPrompt = fs.readFileSync(agentFile, "utf-8");
const userInput = fs.readFileSync(path.resolve(inputFile), "utf-8");

const prompt = `
${systemPrompt}

--- INPUT ---
${userInput}
`;

const output = execSync("ollama run qwen2.5:7b", {
  input: prompt,
  encoding: "utf-8",
  maxBuffer: 50 * 1024 * 1024,
});

console.log(output);
