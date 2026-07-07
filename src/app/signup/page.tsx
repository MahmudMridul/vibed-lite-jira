import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign up to start tracking sprints and work items.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
