import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="text-center">
        <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to make changes to sprints and work items.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
