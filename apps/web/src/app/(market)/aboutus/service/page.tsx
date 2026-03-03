import { Container } from "@/components/web/container";

export default function ServicePage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">服务条款</h1>

        <div className="prose prose-sm">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. 服务协议的范围</h2>
            <p>本协议是您与OpenMCP平台之间关于使用平台服务所订立的协议。</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 服务内容</h2>
            <p>OpenMCP平台提供以下服务：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>MCP客户端和服务器展示</li>
              <li>应用提交和管理</li>
              <li>用户评论和反馈</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 用户责任</h2>
            <p>用户在使用OpenMCP平台服务时应当遵守以下规定：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>遵守中国相关法律法规</li>
              <li>不得上传违法或侵权内容</li>
              <li>尊重其他用户的合法权益</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. 知识产权</h2>
            <p>用户在平台上发布的内容仍归用户所有，但用户授予平台展示和推广的权利。</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. 隐私保护</h2>
            <p>平台将严格保护用户的个人信息，未经用户同意不会向第三方披露。</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. 服务变更和终止</h2>
            <p>平台保留随时修改或终止服务的权利，但会提前通知用户。</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. 免责声明</h2>
            <p>对于因不可抗力或非平台原因造成的服务中断或数据丢失，平台不承担责任。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. 协议修改</h2>
            <p>平台保留修改本协议的权利，修改后的协议将在平台上公布。</p>
          </section>
        </div>
      </div>
    </Container>
  )
}