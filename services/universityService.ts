import { supabase } from "@/lib/supabase"
import type { University } from "@/types/database"

export const universityService = {
  async getAll(): Promise<University[]> {
    const { data, error } = await supabase.from("universities").select("*").order("name")

    if (error) {
      console.error("Error fetching universities:", error)
      throw error
    }

    return data || []
  },

  async getById(id: string): Promise<University | null> {
    const { data, error } = await supabase.from("universities").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching university with id ${id}:`, error)
      throw error
    }

    return data
  },

  async create(university: Omit<University, "id" | "created_at">): Promise<University> {
    const { data, error } = await supabase.from("universities").insert(university).select().single()

    if (error) {
      console.error("Error creating university:", error)
      throw error
    }

    return data
  },

  async update(id: string, university: Partial<University>): Promise<University> {
    const { data, error } = await supabase.from("universities").update(university).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating university with id ${id}:`, error)
      throw error
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("universities").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting university with id ${id}:`, error)
      throw error
    }
  },
}
