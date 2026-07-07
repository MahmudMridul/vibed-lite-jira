import { BacklogsBoard } from "@/components/backlogs-board";
import { getBoardData } from "@/lib/data/board";

export default async function BacklogsPage() {
  const { sprints, workItems, types, priorities } = await getBoardData();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 border-b border-border px-4 py-4 lg:px-6">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Backlogs
        </h1>
        <p className="text-sm text-muted-foreground">
          Drag work items between sprints, or create a new empty sprint.
        </p>
      </div>
      <BacklogsBoard
        initialSprints={sprints}
        initialWorkItems={workItems}
        types={types}
        priorities={priorities}
      />
    </div>
  );
}
