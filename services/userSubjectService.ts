import { supabase } from "@/lib/supabase"
import type { UserSubject, SubjectSchedule } from "@/types/database"

export const userSubjectService = {
  async getByUser(userId: string): Promise<UserSubject[]> {
    const { data, error } = await supabase.from("user_subjects").select("*").eq("user_id", userId)

    if (error) {
      console.error(`Error fetching user subjects for user ${userId}:`, error)
      throw error
    }

    return data || []
  },

  async getByUserAndSubject(userId: string, subjectId: string): Promise<UserSubject | null> {
    const { data, error } = await supabase
      .from("user_subjects")
      .select("*")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "No rows returned" error
      console.error(`Error fetching user subject:`, error)
      throw error
    }

    return data
  },

  async updateStatus(userId: string, subjectId: string, status: UserSubject["status"]): Promise<UserSubject> {
    // Check if record exists
    const existing = await this.getByUserAndSubject(userId, subjectId)

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("user_subjects")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating user subject status:`, error)
        throw error
      }

      return data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from("user_subjects")
        .insert({
          user_id: userId,
          subject_id: subjectId,
          status,
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating user subject:`, error)
        throw error
      }

      return data
    }
  },

  async updateDetails(userId: string, subjectId: string, details: Partial<UserSubject>): Promise<UserSubject> {
    // Check if record exists
    const existing = await this.getByUserAndSubject(userId, subjectId)

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("user_subjects")
        .update({
          ...details,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating user subject details:`, error)
        throw error
      }

      return data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from("user_subjects")
        .insert({
          user_id: userId,
          subject_id: subjectId,
          ...details,
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating user subject:`, error)
        throw error
      }

      return data
    }
  },

  // Métodos para horarios
  async getSchedules(userSubjectId: string): Promise<SubjectSchedule[]> {
    const { data, error } = await supabase.from("subject_schedules").select("*").eq("user_subject_id", userSubjectId)

    if (error) {
      console.error(`Error fetching schedules for user subject ${userSubjectId}:`, error)
      throw error
    }

    return data || []
  },

  async addSchedule(
    userSubjectId: string,
    schedule: Omit<SubjectSchedule, "id" | "user_subject_id" | "created_at">,
  ): Promise<SubjectSchedule> {
    const { data, error } = await supabase
      .from("subject_schedules")
      .insert({
        user_subject_id: userSubjectId,
        ...schedule,
      })
      .select()
      .single()

    if (error) {
      console.error(`Error adding schedule:`, error)
      throw error
    }

    return data
  },

  async updateSchedule(scheduleId: string, schedule: Partial<SubjectSchedule>): Promise<SubjectSchedule> {
    const { data, error } = await supabase
      .from("subject_schedules")
      .update(schedule)
      .eq("id", scheduleId)
      .select()
      .single()

    if (error) {
      console.error(`Error updating schedule:`, error)
      throw error
    }

    return data
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    const { error } = await supabase.from("subject_schedules").delete().eq("id", scheduleId)

    if (error) {
      console.error(`Error deleting schedule:`, error)
      throw error
    }
  },
}
