import { sendMessageToWeWork } from "./wework";

/**
 * 企业微信应用消息回调
 * @param request 请求体
 * @returns 响应体
 */
export async function POST(request: Request) {
  const { text, attachments } = await request.json();
  console.log("[wework] [POST] text attachments", text, attachments);
  const agentid = process.env.WEWORK_AGENTID ? parseInt(process.env.WEWORK_AGENTID) : undefined;

  // WEWORK_WEBHOOK_URL 指的时机器人 webhook 地址，当前只回调app推送消息即可
  const webhookUrl = process.env.WEWORK_WEBHOOK_URL;
  if (!agentid && !webhookUrl) {
    return new Response("Agent ID or Webhook URL is not set", { status: 500 });
  }

  try {
    /**
     * 发送企业微信应用消息。
     */
    await sendMessageToWeWork(text, { attachments, agentid, webhookUrl });
  } catch (error) {
    console.error("[wework] [POST] error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
  return new Response("OK", { status: 200 });
}