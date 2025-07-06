import { AuthEmailTemplate } from "../templates/auth-email";

export default function ResetPassword() {
  return <AuthEmailTemplate link="#" type="reset" />;
}
