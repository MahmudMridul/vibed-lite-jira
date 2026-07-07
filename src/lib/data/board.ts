import { createClient } from "@/lib/supabase/server";
import type { Priority, Sprint, Status, WorkItem, WorkItemType } from "@/lib/types";

export type BoardData = {
  sprints: Sprint[];
  workItems: WorkItem[];
  statuses: Status[];
  types: WorkItemType[];
  priorities: Priority[];
};

const EMPTY_BOARD_DATA: BoardData = {
  sprints: [],
  workItems: [],
  statuses: [],
  types: [],
  priorities: [],
};

export async function getBoardData(): Promise<BoardData> {
  const supabase = await createClient();

  const [
    { data: sprintRows, error: sprintsError },
    { data: statusRows, error: statusesError },
    { data: typeRows, error: typesError },
    { data: priorityRows, error: prioritiesError },
    { data: workItemRows, error: workItemsError },
  ] = await Promise.all([
    supabase
      .from("sprints")
      .select("id, name, start_date, end_date, current_sprint")
      .order("created_at", { ascending: true }),
    supabase.from("statuses").select("id, name, sort_order").order("sort_order"),
    supabase.from("types").select("id, name"),
    supabase.from("priorities").select("id, name, sort_order").order("sort_order"),
    supabase
      .from("work_items")
      .select(
        "id, title, description, status_id, type_id, priority_id, sprint_id, work_item_labels(labels(name))",
      )
      .is("deleted_at", null),
  ]);

  if (sprintsError || statusesError || typesError || prioritiesError || workItemsError) {
    console.error("Failed to load board data", {
      sprintsError,
      statusesError,
      typesError,
      prioritiesError,
      workItemsError,
    });
    return EMPTY_BOARD_DATA;
  }

  const sprints: Sprint[] = (sprintRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    currentSprint: row.current_sprint ?? false,
  }));

  const statuses: Status[] = (statusRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
  }));

  const types: WorkItemType[] = (typeRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));

  const priorities: Priority[] = (priorityRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
  }));

  const workItems: WorkItem[] = (workItemRows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    labels: (row.work_item_labels ?? [])
      .flatMap((link) => link.labels)
      .map((label) => label?.name)
      .filter((name): name is string => Boolean(name)),
    statusId: row.status_id,
    typeId: row.type_id,
    priorityId: row.priority_id,
    sprintId: row.sprint_id,
  }));

  return { sprints, workItems, statuses, types, priorities };
}
