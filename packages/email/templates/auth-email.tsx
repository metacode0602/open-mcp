import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface EmailTemplateProps {
  link: string;
  type: "verify" | "reset" | "confirmation";
  username?: string;
}

const templateConfig = {
  verify: {
    previewText: "验证您的 OpenMCP 账户",
    heading: "验证账户",
    mainText:
      "感谢您注册 OpenMCP！请验证您的邮箱地址以开始使用我们的多云管理平台。",
    buttonText: "验证账户",
    footerText: "如果您没有注册 OpenMCP 账户，可以安全地忽略此邮件。",
  },
  reset: {
    previewText: "重置您的 OpenMCP 密码",
    heading: "重置密码",
    mainText:
      "我们收到了重置 OpenMCP 账户密码的请求。点击下方按钮来设置新密码。",
    buttonText: "重置密码",
    footerText: "如果您没有请求重置密码，可以安全地忽略此邮件。如果您对账户安全有任何疑虑，请联系我们的支持团队。",
  },
  confirmation: {
    previewText: "确认您的 OpenMCP 账户",
    heading: "确认账户",
    mainText:
      "感谢您注册 OpenMCP！请确认您的邮箱地址以开始使用我们的多云管理平台。",
    buttonText: "确认账户",
    footerText: "如果您没有注册 OpenMCP 账户，可以安全地忽略此邮件。",
  },
};

export function AuthEmailTemplate({
  link,
  type,
  username,
}: EmailTemplateProps) {
  const config = templateConfig[type];
  const logoUrl = 'your_logo_url'
  return (
    <Html>
      <Head />
      <Preview>{config.previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-lg border border-solid border-gray-200 bg-white p-8 shadow-sm">
            {/* Logo Section */}
            <Section className="text-center">
              <Img
                src={logoUrl}
                width="40"
                height="40"
                alt="OpenMCP Logo"
                className="mx-auto"
              />
            </Section>

            {/* Header Section */}
            <Heading className="mx-0 my-6 text-center text-2xl font-bold text-gray-800">
              {config.heading}
            </Heading>

            {/* Greeting */}
            <Text className="text-gray-700 text-base mb-4">
              您好 {username ? username : "尊敬的用户"},
            </Text>

            {/* Main Content */}
            <Text className="text-gray-700 text-base mb-6">
              {config.mainText}
            </Text>

            {/* CTA Button */}
            <Section className="text-center mb-8">
              <Button
                className="inline-block rounded-lg bg-blue-600 text-white px-6 py-3 text-center text-sm font-semibold no-underline"
                href={link}
              >
                {config.buttonText}
              </Button>
            </Section>

            {/* Alternative Link */}
            <Text className="text-gray-600 text-sm mb-6">
              或者将此链接复制到浏览器中：{" "}
              <Link href={link} className="text-blue-600 break-all">
                {link}
              </Link>
            </Text>

            <Hr className="border border-solid border-gray-200 my-6" />

            {/* Footer */}
            <Text className="text-gray-500 text-sm">{config.footerText}</Text>

            <Section className="mt-8">
              <Text className="text-xs text-gray-400 text-center">
                © {new Date().getFullYear()} OpenMCP. 保留所有权利。
                <br />
                地址：中国北京市海淀区中关村科技园
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
