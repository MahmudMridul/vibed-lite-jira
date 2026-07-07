"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateWorkItemStatus(workItemId: string, statusId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("work_items")
    .update({ status_id: statusId })
    .eq("id", workItemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { error: null };
}

export async function updateWorkItemSprint(
  workItemId: string,
  sprintId: string | null,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("work_items")
    .update({ sprint_id: sprintId })
    .eq("id", workItemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/backlogs");
  return { error: null };
}

export async function createSprint(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sprints")
    .insert({ name })
    .select("id, name, start_date, end_date, current_sprint")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create sprint", sprint: null };
  }

  revalidatePath("/backlogs");
  return {
    error: null,
    sprint: {
      id: data.id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
      currentSprint: data.current_sprint ?? false,
    },
  };
}
