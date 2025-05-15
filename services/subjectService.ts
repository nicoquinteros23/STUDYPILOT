import { supabase } from "@/lib/supabase"
import type { Subject } from "@/types/database"

export const subjectService = {
  async getAll(): Promise<Subject[]> {
    const { data, error } = await supabase.from("subjects").select("*").order("name")

    if (error) {
      console.error("Error fetching subjects:", error)
      throw error
    }

    return data || []
  },

  async getByCareer(careerId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("career_id", careerId)
      .order("year", { ascending: true })
      .order("name")

    if (error) {
      console.error(`Error fetching subjects for career ${careerId}:`, error)
      throw error
    }

    return data || []
  },

  async getById(id: string): Promise<Subject | null> {
    const { data, error } = await supabase.from("subjects").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching subject with id ${id}:`, error)
      throw error
    }

    return data
  },

  async create(subject: Omit<Subject, "id" | "created_at">): Promise<Subject> {
    const { data, error } = await supabase.from("subjects").insert(subject).select().single()

    if (error) {
      console.error("Error creating subject:", error)
      throw error
    }

    return data
  },

  async update(id: string, subject: Partial<Subject>): Promise<Subject> {
    const { data, error } = await supabase.from("subjects").update(subject).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating subject with id ${id}:`, error)
      throw error
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("subjects").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting subject with id ${id}:`, error)
      throw error
    }
  },

  // Métodos para prerrequisitos
  async getPrerequisites(subjectId: string, type: "course" | "final"): Promise<Subject[]> {
    const { data, error } = await supabase
      .from("subject_prerequisites")
      .select("prerequisite_id")
      .eq("subject_id", subjectId)
      .eq("type", type)

    if (error) {
      console.error(`Error fetching prerequisites for subject ${subjectId}:`, error)
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    const prerequisiteIds = data.map((item) => item.prerequisite_id)

    const { data: prerequisites, error: prereqError } = await supabase
      .from("subjects")
      .select("*")
      .in("id", prerequisiteIds)

    if (prereqError) {
      console.error(`Error fetching prerequisite subjects:`, prereqError)
      throw prereqError
    }

    return prerequisites || []
  },

  async addPrerequisite(subjectId: string, prerequisiteId: string, type: "course" | "final"): Promise<void> {
    const { error } = await supabase.from("subject_prerequisites").insert({
      subject_id: subjectId,
      prerequisite_id: prerequisiteId,
      type,
    })

    if (error) {
      console.error(`Error adding prerequisite:`, error)
      throw error
    }
  },

  async removePrerequisite(subjectId: string, prerequisiteId: string, type: "course" | "final"): Promise<void> {
    const { error } = await supabase
      .from("subject_prerequisites")
      .delete()
      .eq("subject_id", subjectId)
      .eq("prerequisite_id", prerequisiteId)
      .eq("type", type)

    if (error) {
      console.error(`Error removing prerequisite:`, error)
      throw error
    }
  },
}
