import UpdateNameForm from "./form/UpdateNameForm";
import UpdateEmailForm from "./form/UpdateEmailForm";
import UpdatePasswordForm from "./form/UpdatePasswordForm";
import type { Toast, UserData } from "@/lib/types"

interface SettingsTabProps {
  user: UserData;
  onToast: (t: Toast) => void;
}

export default function SettingsTab({ user, onToast }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <UpdateNameForm initialName={user.name} onToast={onToast} />
      <UpdateEmailForm initialEmail={user.email} onToast={onToast} />
      <UpdatePasswordForm onToast={onToast} />
    </div>
  );
};