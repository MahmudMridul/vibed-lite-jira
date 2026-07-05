"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { WorkItemCard } from "@/components/work-item-card";
import {
  MOCK_WORK_ITEMS,
  STATUS_COLUMNS,
  type WorkItem,
  type WorkItemStatus,
} from "@/lib/mock-sprint-data";

function SprintColumn({
  status,
  label,
  items,
  draggedItemId,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  status: WorkItemStatus;
  label: string;
  items: WorkItem[];
  draggedItemId: string | null;
  isDropTarget: boolean;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    itemId: string,
  ) => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (
    event: React.DragEvent<HTMLDivElement>,
    status: WorkItemStatus,
  ) => void;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-xl bg-muted/40 ring-1 ring-foreground/10",
        "basis-full md:min-w-64 md:basis-0",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, status)}
    >
      <div className="flex shrink-0 items-center gap-2 px-3.5 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
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

export function SprintBoard() {
  const [items, setItems] = React.useState<WorkItem[]>(MOCK_WORK_ITEMS);
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(
    null,
  );
  const [dropTargetStatus, setDropTargetStatus] =
    React.useState<WorkItemStatus | null>(null);

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
    setDropTargetStatus(null);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    status: WorkItemStatus,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTargetStatus !== status) setDropTargetStatus(status);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    status: WorkItemStatus,
  ) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain") || draggedItemId;
    if (itemId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status } : item,
        ),
      );
    }
    setDraggedItemId(null);
    setDropTargetStatus(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:overflow-x-auto lg:p-6">
      {STATUS_COLUMNS.map((column) => (
        <SprintColumn
          key={column.id}
          status={column.id}
          label={column.label}
          items={items.filter((item) => item.status === column.id)}
          draggedItemId={draggedItemId}
          isDropTarget={dropTargetStatus === column.id}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(event) => handleDragOver(event, column.id)}
          onDragLeave={() =>
            setDropTargetStatus((prev) => (prev === column.id ? null : prev))
          }
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
