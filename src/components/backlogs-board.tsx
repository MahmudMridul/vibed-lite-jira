"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { WorkItemCard } from "@/components/work-item-card";
import { CreateSprintDialog } from "@/components/create-sprint-dialog";
import {
  BACKLOG_SPRINT_ID,
  MOCK_SPRINTS,
  MOCK_WORK_ITEMS,
  type Sprint,
  type WorkItem,
} from "@/lib/mock-sprint-data";

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return null;
  const format = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  return `${format(startDate)} – ${format(endDate)}`;
}

function SprintSection({
  sprintId,
  title,
  dateRange,
  items,
  draggedItemId,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  sprintId: string;
  title: string;
  dateRange: string | null;
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
  onDrop: (event: React.DragEvent<HTMLDivElement>, sprintId: string) => void;
}) {
  return (
    <div
      className="flex min-h-32 flex-col rounded-xl bg-muted/40 ring-1 ring-foreground/10"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, sprintId)}
    >
      <div className="flex shrink-0 items-center gap-2 px-3.5 py-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {dateRange && (
          <span className="text-xs text-muted-foreground">{dateRange}</span>
        )}
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>

      <div
        className={cn(
          "flex min-h-24 flex-col gap-2 rounded-b-xl px-2.5 pb-3",
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

export function BacklogsBoard() {
  const [sprints, setSprints] = React.useState<Sprint[]>(MOCK_SPRINTS);
  const [items, setItems] = React.useState<WorkItem[]>(MOCK_WORK_ITEMS);
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(
    null,
  );
  const [dropTargetSprintId, setDropTargetSprintId] = React.useState<
    string | null
  >(null);

  const handleCreateSprint = (name: string) => {
    const id = `sprint-${Date.now()}`;
    setSprints((prev) => [...prev, { id, name, startDate: null, endDate: null }]);
  };

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
    setDropTargetSprintId(null);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    sprintId: string,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTargetSprintId !== sprintId) setDropTargetSprintId(sprintId);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    sprintId: string,
  ) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain") || draggedItemId;
    if (itemId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                sprintId: sprintId === BACKLOG_SPRINT_ID ? null : sprintId,
              }
            : item,
        ),
      );
    }
    setDraggedItemId(null);
    setDropTargetSprintId(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
      <div className="flex shrink-0 justify-end">
        <CreateSprintDialog onCreate={handleCreateSprint} />
      </div>

      {sprints.map((sprint) => (
        <SprintSection
          key={sprint.id}
          sprintId={sprint.id}
          title={sprint.name}
          dateRange={formatDateRange(sprint.startDate, sprint.endDate)}
          items={items.filter((item) => item.sprintId === sprint.id)}
          draggedItemId={draggedItemId}
          isDropTarget={dropTargetSprintId === sprint.id}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(event) => handleDragOver(event, sprint.id)}
          onDragLeave={() =>
            setDropTargetSprintId((prev) => (prev === sprint.id ? null : prev))
          }
          onDrop={handleDrop}
        />
      ))}

      <SprintSection
        sprintId={BACKLOG_SPRINT_ID}
        title="Backlog"
        dateRange={null}
        items={items.filter((item) => item.sprintId === null)}
        draggedItemId={draggedItemId}
        isDropTarget={dropTargetSprintId === BACKLOG_SPRINT_ID}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => handleDragOver(event, BACKLOG_SPRINT_ID)}
        onDragLeave={() =>
          setDropTargetSprintId((prev) =>
            prev === BACKLOG_SPRINT_ID ? null : prev,
          )
        }
        onDrop={handleDrop}
      />
    </div>
  );
}
