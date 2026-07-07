"use client";

import { Bug, BookText, SquareCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Priority, WorkItem, WorkItemType } from "@/lib/types";

const TYPE_ICON: Record<string, React.ElementType> = {
  task: SquareCheck,
  bug: Bug,
  story: BookText,
};

const DEFAULT_TYPE_ICON = SquareCheck;

const TYPE_ICON_COLOR: Record<string, string> = {
  task: "text-blue-500",
  bug: "text-red-500",
  story: "text-emerald-500",
};

const DEFAULT_TYPE_ICON_COLOR = "text-blue-500";

const PRIORITY_VARIANT: Record<
  string,
  "secondary" | "outline" | "default" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

const DEFAULT_PRIORITY_VARIANT = "secondary";

export function WorkItemCard({
  item,
  type,
  priority,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  item: WorkItem;
  type: WorkItemType | undefined;
  priority: Priority | undefined;
  dragging: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const typeKey = type?.name.toLowerCase() ?? "";
  const TypeIcon = TYPE_ICON[typeKey] ?? DEFAULT_TYPE_ICON;
  const typeIconColor = TYPE_ICON_COLOR[typeKey] ?? DEFAULT_TYPE_ICON_COLOR;
  const priorityVariant =
    PRIORITY_VARIANT[priority?.name.toLowerCase() ?? ""] ??
    DEFAULT_PRIORITY_VARIANT;

  return (
    <Card
      size="sm"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      aria-roledescription="Draggable work item"
      className={cn(
        "cursor-grab gap-2.5 px-3.5 transition-opacity active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <p className="text-sm leading-snug font-medium text-card-foreground">
        {item.title}
      </p>

      {item.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 px-(--card-spacing)">
          {item.labels.map((label) => (
            <Badge key={label} variant="outline" className="text-[10px]">
              {label}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 px-(--card-spacing)">
        <TypeIcon className={cn("size-4 shrink-0", typeIconColor)} />
        {priority && (
          <Badge variant={priorityVariant} className="text-[10px] capitalize">
            {priority.name}
          </Badge>
        )}
      </div>
    </Card>
  );
}
