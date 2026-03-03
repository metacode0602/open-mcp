import { Container } from "@/components/web/container";

export default function PrivacyPolicyPage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">隐私政策</h1>

        <div className="prose prose-sm">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. 信息收集</h2>
            <p>我们收集的信息包括：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>账户信息（用户名、电子邮件等）</li>
              <li>使用数据（访问日志、操作记录等）</li>
              <li>设备信息（浏览器类型、操作系统等）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 信息使用</h2>
            <p>我们使用收集的信息用于：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>提供和改进服务</li>
              <li>个性化用户体验</li>
              <li>发送服务通知和更新</li>
              <li>处理用户反馈和请求</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 信息共享</h2>
            <p>除以下情况外，我们不会与第三方分享用户信息：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>用户明确同意</li>
              <li>法律要求</li>
              <li>保护平台及用户权益</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. 信息安全</h2>
            <p>我们采取多种安全措施保护用户信息：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>数据加密存储</li>
              <li>访问控制</li>
              <li>定期安全审计</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Cookie使用</h2>
            <p>我们使用Cookie来改善用户体验，包括：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>保持登录状态</li>
              <li>记住用户偏好</li>
              <li>收集使用统计数据</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. 用户权利</h2>
            <p>用户对自己的个人信息拥有以下权利：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>访问和导出个人数据</li>
              <li>更正不准确信息</li>
              <li>要求删除账户</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. 儿童隐私</h2>
            <p>我们的服务不面向13岁以下儿童，如发现误收集儿童信息将立即删除。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. 政策更新</h2>
            <p>我们可能会更新本隐私政策，更新后将在网站公布并通知用户。</p>
            <p className="mt-4">最后更新日期：2025年5月1日</p>
          </section>
        </div>
      </div>
    </Container>
  )
}