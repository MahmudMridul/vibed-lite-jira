"use client";

import { Bug, BookText, SquareCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { WorkItem } from "@/lib/mock-sprint-data";

const TYPE_ICON: Record<WorkItem["type"], React.ElementType> = {
  task: SquareCheck,
  bug: Bug,
  story: BookText,
};

const TYPE_ICON_COLOR: Record<WorkItem["type"], string> = {
  task: "text-blue-500",
  bug: "text-red-500",
  story: "text-emerald-500",
};

const PRIORITY_VARIANT: Record<
  WorkItem["priority"],
  "secondary" | "outline" | "default" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

export function WorkItemCard({
  item,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  item: WorkItem;
  dragging: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const TypeIcon = TYPE_ICON[item.type];

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

      <div className="flex items-center justify-between px-(--card-spacing)">
        <div className="flex items-center gap-2">
          <TypeIcon
            className={cn("size-4 shrink-0", TYPE_ICON_COLOR[item.type])}
          />
          <span className="text-xs text-muted-foreground">{item.id}</span>
          <Badge
            variant={PRIORITY_VARIANT[item.priority]}
            className="text-[10px] capitalize"
          >
            {item.priority}
          </Badge>
        </div>

        {item.assignee ? (
          <Avatar size="sm" title={item.assignee.name}>
            <AvatarFallback>{item.assignee.initials}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar size="sm" title="Unassigned">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  );
}
