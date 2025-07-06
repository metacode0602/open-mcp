import { openai } from "@ai-sdk/openai";
import { jsonSchema, streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;


export async function POST(req: Request) {
  const { messages, tools } = await req.json();
  console.log("messages", messages);
  console.log("tools", tools);
  const ip = req.headers.get("x-forwarded-for") ?? "ip";


  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    maxTokens: 1200,
    maxSteps: 10,
    tools: {
      ...Object.fromEntries(
        Object.entries<{ parameters: unknown }>(tools).map(([name, tool]) => [
          name,
          {
            parameters: jsonSchema(tool.parameters!),
          },
        ]),
      ),
    },
  });

  return result.toDataStreamResponse();
}