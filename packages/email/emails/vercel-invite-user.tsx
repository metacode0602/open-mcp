import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface VercelInviteUserEmailProps {
  username?: string;
  userImage?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
}

const baseUrl = process.env.BETTER_AUTH_URL
  ? `${process.env.BETTER_AUTH_URL}`
  : '';

export const VercelInviteUserEmail = ({
  username = 'zenorocha',
  userImage = `${baseUrl}/static/vercel-user.png`,
  invitedByUsername = 'bukinoshita',
  invitedByEmail = 'bukinoshita@example.com',
  teamName = 'My Project',
  teamImage = `${baseUrl}/static/vercel-team.png`,
  inviteLink = 'https://openmcp.com/teams/invite/foo',
  inviteFromIp = '204.13.186.218',
  inviteFromLocation = '北京, 中国',
}: VercelInviteUserEmailProps) => {
  const previewText = `加入 ${invitedByUsername} 的 OpenMCP 团队`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/static/logo.png`}
                width="40"
                height="37"
                alt="OpenMCP"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              加入 <strong>{teamName}</strong> 的 <strong>OpenMCP</strong> 团队
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              您好 {username}，
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) 邀请您加入 <strong>{teamName}</strong> 的 <strong>OpenMCP</strong> 团队。
            </Text>
            <Section>
              <Row>
                <Column align="right">
                  <Img className="rounded-full" src={userImage} width="64" height="64" />
                </Column>
                <Column align="center">
                  <Img
                    src={`${baseUrl}/static/arrow.png`}
                    width="12"
                    height="9"
                    alt="邀请您加入"
                  />
                </Column>
                <Column align="left">
                  <Img className="rounded-full" src={teamImage} width="64" height="64" />
                </Column>
              </Row>
            </Section>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#0066cc] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
                href={inviteLink}
              >
                加入团队
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              或复制以下链接到浏览器中：{' '}
              <Link
                href={inviteLink}
                className="text-blue-600 no-underline"
              >
                {inviteLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              此邀请发送给{' '}
              <span className="text-black">{username}</span>。此邀请来自 IP 地址{' '}
              <span className="text-black">{inviteFromIp}</span>，位于{' '}
              <span className="text-black">{inviteFromLocation}</span>。如果您没有预期收到此邀请，
              可以忽略此邮件。如果您对账户安全有任何疑虑，请直接回复此邮件与我们联系。
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px] mt-[32px]">
              © {new Date().getFullYear()} OpenMCP 多云管理平台。保留所有权利。
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VercelInviteUserEmail;
