interface PasswordStrengthProps {
  password: string;
};

function getStrength(password: string) {
  if (!password) return null;
  if (password.length < 4) return { label: "Weak", color: "bg-destructive", width: "w-1/4" };
  if (password.length < 6) return { label: "Fair", color: "bg-yellow-500", width: "w-1/2" };
  if (password.length < 8) return { label: "Good", color: "bg-primary", width: "w-3/4" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
};

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);
  if (!strength) return null;

  return (
    <div className="space-y-1">
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="text-foreground">{strength.label}</span>
      </p>
    </div>
  );
};