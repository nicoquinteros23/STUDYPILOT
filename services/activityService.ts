import { supabase } from "@/lib/supabase"
import type { Activity, ActivitySchedule } from "@/types/database"

export const activityService = {
  async getByUser(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error fetching activities for user ${userId}:`, error)
      throw error
    }

    return data || []
  },

  async getById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase.from("activities").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching activity with id ${id}:`, error)
      throw error
    }

    return data
  },

  async create(activity: Omit<Activity, "id" | "created_at">): Promise<Activity> {
    const { data, error } = await supabase.from("activities").insert(activity).select().single()

    if (error) {
      console.error("Error creating activity:", error)
      throw error
    }

    return data
  },

  async update(id: string, activity: Partial<Activity>): Promise<Activity> {
    const { data, error } = await supabase.from("activities").update(activity).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating activity with id ${id}:`, error)
      throw error
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("activities").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting activity with id ${id}:`, error)
      throw error
    }
  },

  // Métodos para horarios de actividades
  async getSchedules(activityId: string): Promise<ActivitySchedule[]> {
    const { data, error } = await supabase.from("activity_schedules").select("*").eq("activity_id", activityId)

    if (error) {
      console.error(`Error fetching schedules for activity ${activityId}:`, error)
      throw error
    }

    return data || []
  },

  async addSchedule(
    activityId: string,
    schedule: Omit<ActivitySchedule, "id" | "activity_id" | "created_at">,
  ): Promise<ActivitySchedule> {
    const { data, error } = await supabase
      .from("activity_schedules")
      .insert({
        activity_id: activityId,
        ...schedule,
      })
      .select()
      .single()

    if (error) {
      console.error(`Error adding activity schedule:`, error)
      throw error
    }

    return data
  },

  async updateSchedule(scheduleId: string, schedule: Partial<ActivitySchedule>): Promise<ActivitySchedule> {
    const { data, error } = await supabase
      .from("activity_schedules")
      .update(schedule)
      .eq("id", scheduleId)
      .select()
      .single()

    if (error) {
      console.error(`Error updating activity schedule:`, error)
      throw error
    }

    return data
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    const { error } = await supabase.from("activity_schedules").delete().eq("id", scheduleId)

    if (error) {
      console.error(`Error deleting activity schedule:`, error)
      throw error
    }
  },
}
