import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';

interface VerifySubscriptionEmailProps {
  verifyUrl: string
  unsubscribeUrl?: string
}

export default function VerifySubscriptionEmail({
  verifyUrl,
  unsubscribeUrl,
}: VerifySubscriptionEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Preview>验证您的邮箱订阅</Preview>
        <Section style={main}>
          <Container style={container}>
            <Img
              src={`${process.env.BETTER_AUTH_URL}/static/logo.png`}
              width="72"
              height="72"
              alt="MCP Logo"
              style={logo}
            />
            <Text style={heading}>验证您的邮箱订阅</Text>
            <Text style={paragraph}>
              感谢您订阅我们的邮件列表！请点击下面的按钮来验证您的邮箱地址。
            </Text>
            <Button style={{ ...button, paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12 }} href={verifyUrl}>
              验证邮箱
            </Button>
            <Text style={paragraph}>
              如果按钮无法点击，请复制以下链接到浏览器中打开：
              <br />
              <Link href={verifyUrl} style={link}>
                {verifyUrl}
              </Link>
            </Text>
            {unsubscribeUrl && (
              <Text style={footer}>
                如果您没有订阅我们的邮件，请忽略此邮件或{" "}
                <Link href={unsubscribeUrl} style={link}>
                  点击这里取消订阅
                </Link>
                。
              </Text>
            )}
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
}

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
}

const paragraph = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#484848",
}

const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
}

const link = {
  color: "#2754C5",
  textDecoration: "underline",
}

const footer = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#9ca299",
  marginTop: "48px",
}

const logo = {
  margin: "0 auto 24px",
  display: "block",
}