export type WorkItemStatus = "todo" | "in_progress" | "done";

export type WorkItemPriority = "low" | "medium" | "high" | "urgent";

export type WorkItemType = "task" | "bug" | "story";

export type WorkItem = {
  id: string;
  title: string;
  type: WorkItemType;
  priority: WorkItemPriority;
  labels: string[];
  assignee: {
    name: string;
    initials: string;
  } | null;
  status: WorkItemStatus;
};

export const STATUS_COLUMNS: { id: WorkItemStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: "VLJ-1",
    title: "Set up Supabase auth flow",
    type: "task",
    priority: "high",
    labels: ["backend"],
    assignee: { name: "Amara Chen", initials: "AC" },
    status: "todo",
  },
  {
    id: "VLJ-2",
    title: "Design work item type icons",
    type: "task",
    priority: "low",
    labels: ["design"],
    assignee: { name: "Diego Reyes", initials: "DR" },
    status: "todo",
  },
  {
    id: "VLJ-3",
    title: "Fix sidebar collapse flicker on load",
    type: "bug",
    priority: "medium",
    labels: ["frontend"],
    assignee: null,
    status: "todo",
  },
  {
    id: "VLJ-4",
    title: "Build backlog drag-and-drop reordering",
    type: "story",
    priority: "high",
    labels: ["frontend", "backlog"],
    assignee: { name: "Amara Chen", initials: "AC" },
    status: "in_progress",
  },
  {
    id: "VLJ-5",
    title: "Wire up priority settings page",
    type: "task",
    priority: "medium",
    labels: ["settings"],
    assignee: { name: "Priya Nair", initials: "PN" },
    status: "in_progress",
  },
  {
    id: "VLJ-6",
    title: "Investigate flaky sprint date filter",
    type: "bug",
    priority: "urgent",
    labels: ["bug", "backend"],
    assignee: { name: "Diego Reyes", initials: "DR" },
    status: "in_progress",
  },
  {
    id: "VLJ-7",
    title: "Scaffold project with Next.js and Tailwind",
    type: "task",
    priority: "medium",
    labels: ["chore"],
    assignee: { name: "Priya Nair", initials: "PN" },
    status: "done",
  },
  {
    id: "VLJ-8",
    title: "Add dark mode theme tokens",
    type: "task",
    priority: "low",
    labels: ["design"],
    assignee: { name: "Amara Chen", initials: "AC" },
    status: "done",
  },
];
