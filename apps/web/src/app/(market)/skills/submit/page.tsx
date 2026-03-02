import type { Metadata } from "next"
import { SkillSubmitForm } from "../components/skill-submit-form"

export const metadata: Metadata = {
  title: "提交 Skill - OpenClaw Skills",
  description: "通过 GitHub 仓库地址或 ZIP 包上传方式提交你的 Skill 到 OpenClaw Skills 仓库。",
}

export default function SkillSubmitPage() {
  return (
    <main className="flex-1">
      <SkillSubmitForm />
    </main>
  )
}
