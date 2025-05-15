import { supabase } from "@/lib/supabase"
import type { ExamBoard } from "@/types/database"

export const examBoardService = {
  async getByUser(userId: string): Promise<ExamBoard[]> {
    const { data, error } = await supabase.from("exam_boards").select("*").eq("user_id", userId).order("start_date")

    if (error) {
      console.error(`Error fetching exam boards for user ${userId}:`, error)
      throw error
    }

    return data || []
  },

  async getById(id: string): Promise<ExamBoard | null> {
    const { data, error } = await supabase.from("exam_boards").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching exam board with id ${id}:`, error)
      throw error
    }

    return data
  },

  async create(examBoard: Omit<ExamBoard, "id" | "created_at">): Promise<ExamBoard> {
    const { data, error } = await supabase.from("exam_boards").insert(examBoard).select().single()

    if (error) {
      console.error("Error creating exam board:", error)
      throw error
    }

    return data
  },

  async update(id: string, examBoard: Partial<ExamBoard>): Promise<ExamBoard> {
    const { data, error } = await supabase.from("exam_boards").update(examBoard).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating exam board with id ${id}:`, error)
      throw error
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("exam_boards").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting exam board with id ${id}:`, error)
      throw error
    }
  },
}
