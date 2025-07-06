import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface AWSVerifyEmailProps {
  subject?: string;
  verificationCode?: string;
  magicLink?: string;
}

const baseUrl = process.env.BETTER_AUTH_URL
  ? `${process.env.BETTER_AUTH_URL}`
  : '';

export default function AWSVerifyEmail({
  subject = "OpenMCP 账户验证",
  verificationCode,
  magicLink,
}: AWSVerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject ? subject : "OpenMCP 账户验证"}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img
                src={`${baseUrl}/static/logo.png`}
                width="75"
                height="75"
                alt="OpenMCP Logo"
              />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>验证您的邮箱地址</Heading>
              <Text style={mainText}>
                感谢您开始创建 OpenMCP 账户。为了确保是您本人在进行操作，
                {magicLink ? "请点击下方按钮登录。" : "请在提示时输入以下验证码。"}
              </Text>
              {magicLink ? (
                <Section style={verificationSection}>
                  <Button style={buttonStyle} href={magicLink}>
                    一键登录
                  </Button>
                  <Text style={validityText}>
                    (此链接有效期为10分钟)
                  </Text>
                  <Text style={mainText}>
                    或者复制以下链接到浏览器中：{" "}
                    <Link href={magicLink} style={link}>
                      {magicLink}
                    </Link>
                  </Text>
                </Section>
              ) : (
                <Section style={verificationSection}>
                  <Text style={verifyText}>验证码</Text>
                  <Text style={codeText}>{verificationCode}</Text>
                  <Text style={validityText}>
                    (此验证码有效期为10分钟)
                  </Text>
                </Section>
              )}
            </Section>
            <Hr style={hrStyle} />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                OpenMCP 绝不会通过邮件要求您透露或验证您的密码、信用卡或银行账户信息。
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            此邮件由 OpenMCP 系统自动发送。© {new Date().getFullYear()} OpenMCP。保留所有权利。
            查看我们的{" "}
            <Link href="https://openmcp.com/privacy" target="_blank" style={link}>
              隐私政策
            </Link>
            。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const buttonStyle = {
  backgroundColor: "#2754C5",
  borderRadius: "4px",
  color: "#fff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
};

const imageSection = {
  display: "flex",
  padding: "20px 0",
  alignItems: "center",
  justifyContent: "center",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: "bold",
  textAlign: "center" as const,
};

const codeText = {
  ...text,
  fontWeight: "bold",
  fontSize: "36px",
  margin: "10px 0",
  textAlign: "center" as const,
};

const validityText = {
  ...text,
  margin: "0px",
  textAlign: "center" as const,
};

const verificationSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column" as const,
  margin: "30px 0",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };

const hrStyle = {
  border: "none",
  borderTop: "1px solid #eaeaea",
  margin: "26px 0",
  width: "100%",
};
