import { supabase } from "@/lib/supabase"
import type { Career } from "@/types/database"

export const careerService = {
  async getAll(): Promise<Career[]> {
    const { data, error } = await supabase.from("careers").select("*").order("name")

    if (error) {
      console.error("Error fetching careers:", error)
      throw error
    }

    return data || []
  },

  async getByUniversity(universityId: string): Promise<Career[]> {
    const { data, error } = await supabase.from("careers").select("*").eq("university_id", universityId).order("name")

    if (error) {
      console.error(`Error fetching careers for university ${universityId}:`, error)
      throw error
    }

    return data || []
  },

  async getById(id: string): Promise<Career | null> {
    const { data, error } = await supabase.from("careers").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching career with id ${id}:`, error)
      throw error
    }

    return data
  },

  async create(career: Omit<Career, "id" | "created_at">): Promise<Career> {
    const { data, error } = await supabase.from("careers").insert(career).select().single()

    if (error) {
      console.error("Error creating career:", error)
      throw error
    }

    return data
  },

  async update(id: string, career: Partial<Career>): Promise<Career> {
    const { data, error } = await supabase.from("careers").update(career).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating career with id ${id}:`, error)
      throw error
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("careers").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting career with id ${id}:`, error)
      throw error
    }
  },
}
