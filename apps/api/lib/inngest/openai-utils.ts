import { features } from "node:process";

/**
 * 将内容翻译成中文
 * @param readme 
 * @returns 
 */
export const translateContent = async (readme: string) => {
  if (!readme || readme.trim().length === 0) return readme; // 如果没有内容，直接返回
  try {
    // 使用OpenAI API进行翻译
    const response = await fetch(`${process.env.OPENAI_URL_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: `${process.env.OPENAI_MODEL}`,
        stream: false,
        messages: [
          {
            role: "system",
            content: "你是一个专业的技术文档翻译专家。请将输入的英文README文档翻译成中文，保持文档的格式不变，包括markdown标记、代码块等。保持专业术语的准确性。",
          },
          {
            role: "user",
            content: readme,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("Translation failed:", await response.text());
    } else {
      const result = await response.json();
      return result.choices[0].message.content;
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
  return readme; // 如果翻译失败，返回原始内容
}


export const extractFeatures = async (readme: string) => {
  const response = await fetch(`${process.env.OPENAI_URL_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: `${process.env.OPENAI_MODEL}`,
      stream: false,
      enable_thinking: false,
      messages: [
        {
          role: "system",
          content: "你是一个专业的技术分析专家。请分析提供的README文档，输出以下格式的内容：\n1. 核心功能特性：用JSON数组格式列出该应用的主要功能点（最多5点），每个功能用一句话描述\n2. 应用概要：用一段markdown格式的文字（不超过300字）描述这个应用是什么，能做什么。可以使用markdown的加粗、链接等格式。\n\n请注意：\n- 必须输出中文。\n- 只需要返回JSON格式的内容，不要添加任何其他文字。\n- 如果无法分析出特性或概要，请返回空数组或空字符串。\n- 请确保输出的JSON格式正确，JSON格式为： const zSummarySchema = z.object({  features: z.array(z.string()),  summary: z.string()})。",
        },
        {
          role: "user",
          content: readme,
        },
      ],
      temperature: 0.3,
    }),
  });
  console.info("[api] [inngest] [anaylyser.ts] [readReadme] features and summary response", response)
  if (!response.ok) {
    console.error("Features/Summary generation failed:", await response.text());
    return { features: [], summary: "" };
  }

  const result = await response.json();
  console.info("[api] [inngest] [anaylyser.ts] [readReadme] features and summary result", JSON.stringify(result, null, 2))

  const analysis = result.choices[0].message.content;
  console.info("[api] [inngest] [anaylyser.ts] [readReadme] features and summary content", analysis)

  // 解析返回的内容，分离特性和概要
  const jsonString = analysis
    .replace(/^```json\n?/, '') // Remove opening ```json
    .replace(/\n?```$/, '') // Remove closing ```
  const json = JSON.parse(jsonString);
  return { features: json?.features, summary: json?.summary };
}