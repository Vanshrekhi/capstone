import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatOpenAI({
  model: "deepseek/deepseek-chat-v3",
  apiKey: process.env.OPEN_ROUTER_API_KEY,

  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },

  temperature: 0.2,

  // IMPORTANT
  maxTokens: 2000,
});

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