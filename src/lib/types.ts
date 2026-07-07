export type Status = { id: string; name: string; sortOrder: number };
export type WorkItemType = { id: string; name: string };
export type Priority = { id: string; name: string; sortOrder: number };

export type WorkItem = {
  id: string;
  title: string;
  description: string | null;
  labels: string[];
  statusId: string;
  typeId: string;
  priorityId: string | null;
  sprintId: string | null;
};

export type Sprint = {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  currentSprint: boolean;
};

export const BACKLOG_SPRINT_ID = "backlog";
