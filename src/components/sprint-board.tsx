"use client";

import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { WorkItemCard } from "@/components/work-item-card";
import { updateWorkItemStatus } from "@/lib/actions/board";
import type { Priority, Status, WorkItem, WorkItemType } from "@/lib/types";

function SprintColumn({
  status,
  items,
  types,
  priorities,
  draggedItemId,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  status: Status;
  items: WorkItem[];
  types: WorkItemType[];
  priorities: Priority[];
  draggedItemId: string | null;
  isDropTarget: boolean;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    itemId: string,
  ) => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, statusId: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-xl bg-muted/40 ring-1 ring-foreground/10",
        "basis-full md:min-w-64 md:basis-0",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, status.id)}
    >
      <div className="flex shrink-0 items-center gap-2 px-3.5 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {status.name}
        </h2>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>

      <div
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto rounded-b-xl px-2.5 pb-3",
          isDropTarget && "bg-primary/5 ring-2 ring-inset ring-primary/40",
        )}
      >
        {items.map((item) => (
          <WorkItemCard
            key={item.id}
            item={item}
            type={types.find((type) => type.id === item.typeId)}
            priority={priorities.find(
              (priority) => priority.id === item.priorityId,
            )}
            dragging={draggedItemId === item.id}
            onDragStart={(event) => onDragStart(event, item.id)}
            onDragEnd={onDragEnd}
          />
        ))}

        {items.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            No work items
          </div>
        )}
      </div>
    </div>
  );
}

export function SprintBoard({
  initialWorkItems,
  statuses,
  types,
  priorities,
}: {
  initialWorkItems: WorkItem[];
  statuses: Status[];
  types: WorkItemType[];
  priorities: Priority[];
}) {
  const [items, setItems] = React.useState<WorkItem[]>(initialWorkItems);
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(
    null,
  );
  const [dropTargetStatusId, setDropTargetStatusId] = React.useState<
    string | null
  >(null);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    itemId: string,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);
    setDraggedItemId(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDropTargetStatusId(null);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    statusId: string,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTargetStatusId !== statusId) setDropTargetStatusId(statusId);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    statusId: string,
  ) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain") || draggedItemId;
    setDraggedItemId(null);
    setDropTargetStatusId(null);
    if (!itemId) return;

    const previousItems = items;
    const item = items.find((existing) => existing.id === itemId);
    if (!item || item.statusId === statusId) return;

    setItems((prev) =>
      prev.map((existing) =>
        existing.id === itemId ? { ...existing, statusId } : existing,
      ),
    );

    updateWorkItemStatus(itemId, statusId).then((result) => {
      if (result.error) {
        setItems(previousItems);
        toast.error("Couldn't update status", { description: result.error });
      }
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:overflow-x-auto lg:p-6">
      {statuses.map((status) => (
        <SprintColumn
          key={status.id}
          status={status}
          items={items.filter((item) => item.statusId === status.id)}
          types={types}
          priorities={priorities}
          draggedItemId={draggedItemId}
          isDropTarget={dropTargetStatusId === status.id}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(event) => handleDragOver(event, status.id)}
          onDragLeave={() =>
            setDropTargetStatusId((prev) => (prev === status.id ? null : prev))
          }
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
