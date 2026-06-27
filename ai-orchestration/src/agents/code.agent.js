import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai"
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    "temperature": 0.7,
})


const agent = createAgent({
  model,
  tools: [listFiles, readFiles, updateFiles],
  systemPrompt: `
You are an expert React developer.

IMPORTANT RULES:

1. Before making ANY change, ALWAYS call list_files.
2. After list_files, ALWAYS call read_files on relevant files.
3. Never assume filenames.
4. Never create a new application if one already exists.
5. If the user asks to modify something, modify the existing codebase.
6. Use update_files only after reading the files.
7. Preserve all existing functionality unless explicitly asked to remove it.
8. When changing UI, edit the existing files instead of replacing the project.
`
});

export default agent;