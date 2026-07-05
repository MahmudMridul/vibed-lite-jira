import { SprintBoard } from "@/components/sprint-board";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 border-b border-border px-4 py-4 lg:px-6">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Active Sprint
        </h1>
        <p className="text-sm text-muted-foreground">
          Drag work items across lanes as their status changes.
        </p>
      </div>
      <SprintBoard />
    </div>
  );
}
