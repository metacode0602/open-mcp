
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SubmissionsList } from "@/components/admin/submissions/submissions-list";
export default function SubmissionsPage() {
	return (
		<div className="space-y-6">
			<AdminPageHeader title="应用提交审核" description="管理用户提交的应用程序，进行审核和处理。" />
			<SubmissionsList />
		</div>
	);
}
