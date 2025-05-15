"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { Subject, StudyPlan, StudyPlanWithSubject } from "@/types/database"
import { useAuth } from "./AuthContext"

interface StudyPlanContextType {
  subjects: Subject[]
  studyPlans: StudyPlanWithSubject[]
  isLoading: boolean
  error: Error | null
  addSubject: (subject: Omit<Subject, "id" | "created_at">) => Promise<void>
  updateStudyPlan: (studyPlanId: string, updates: Partial<StudyPlan>) => Promise<void>
  refreshSubjects: () => Promise<void>
  refreshStudyPlans: () => Promise<void>
}

const StudyPlanContext = createContext<StudyPlanContextType | undefined>(undefined)

export function StudyPlanProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [studyPlans, setStudyPlans] = useState<StudyPlanWithSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("year", { ascending: true })
        .order("semester", { ascending: true })

      if (error) throw error
      setSubjects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar las materias"))
    }
  }

  const fetchStudyPlans = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("study_plans")
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setStudyPlans(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar el plan de estudios"))
    }
  }

  useEffect(() => {
    fetchSubjects()
    if (user) {
      fetchStudyPlans()
    }
    setIsLoading(false)
  }, [user])

  const addSubject = async (subject: Omit<Subject, "id" | "created_at">) => {
    try {
      const { error } = await supabase
        .from("subjects")
        .insert([subject])

      if (error) throw error
      await fetchSubjects()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al agregar la materia"))
      throw err
    }
  }

  const updateStudyPlan = async (studyPlanId: string, updates: Partial<StudyPlan>) => {
    try {
      const { error } = await supabase
        .from("study_plans")
        .update(updates)
        .eq("id", studyPlanId)

      if (error) throw error
      await fetchStudyPlans()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al actualizar el plan de estudios"))
      throw err
    }
  }

  const refreshSubjects = fetchSubjects
  const refreshStudyPlans = fetchStudyPlans

  return (
    <StudyPlanContext.Provider
      value={{
        subjects,
        studyPlans,
        isLoading,
        error,
        addSubject,
        updateStudyPlan,
        refreshSubjects,
        refreshStudyPlans,
      }}
    >
      {children}
    </StudyPlanContext.Provider>
  )
}

export function useStudyPlan() {
  const context = useContext(StudyPlanContext)
  if (context === undefined) {
    throw new Error("useStudyPlan debe ser usado dentro de un StudyPlanProvider")
  }
  return context
} 