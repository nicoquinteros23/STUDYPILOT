export interface University {
  id: string
  name: string
  description?: string
  logo?: string
  created_at?: string
}

export interface Career {
  id: string
  university_id: string
  name: string
  description?: string
  duration?: string
  created_at?: string
}

export type Subject = {
  id: string
  code: string
  name: string
  year: number
  credits: number
  semester: number
  correlativas_cursado: string[]
  correlativas_final: string[]
  created_at: string
}

export interface SubjectPrerequisite {
  id: string
  subject_id: string
  prerequisite_id: string
  type: "course" | "final"
  created_at?: string
}

export interface UserSubject {
  id: string
  user_id: string
  subject_id: string
  status: "notStarted" | "inProgress" | "pendingFinal" | "approved"
  commission?: string
  professor?: string
  created_at?: string
  updated_at?: string
}

export interface SubjectSchedule {
  id: string
  user_subject_id: string
  day: string
  start_time: string
  end_time: string
  created_at?: string
}

export interface Activity {
  id: string
  user_id: string
  name: string
  type?: string
  description?: string
  created_at?: string
}

export interface ActivitySchedule {
  id: string
  activity_id: string
  day: string
  start_time: string
  end_time: string
  created_at?: string
}

export interface ExamBoard {
  id: string
  user_id: string
  board_number: string
  start_date: string
  end_date: string
  description?: string
  created_at?: string
}

export type StudyPlan = {
  id: string
  user_id: string
  subject_id: string
  status: 'pending' | 'in_progress' | 'completed'
  grade?: number
  notes?: string
  created_at: string
  updated_at: string
  subject?: Subject
}

export type StudyPlanWithSubject = StudyPlan & {
  subject: Subject
}

// Tipos para la respuesta de Supabase
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}
