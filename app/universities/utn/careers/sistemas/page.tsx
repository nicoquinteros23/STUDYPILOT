"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface Subject {
  id: string
  code: string
  name: string
  year: number
  semester: number
  credits: number
  correlativas_cursado: string[]
  correlativas_final: string[]
}

interface UserSubject {
  id: string
  subject_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'pendingFinal'
  grade?: number
  notes?: string
}

interface SubjectWithStatus extends Subject {
  userStatus?: UserSubject
}

export default function SistemasCareerPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [subjects, setSubjects] = useState<SubjectWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acceso restringido",
        description: "Debes iniciar sesión para ver esta página.",
        variant: "destructive",
      })
      router.push('/auth/login')
      return
    }
    loadSubjects()
  }, [user, router, toast])

  const loadSubjects = async () => {
    try {
      setIsLoading(true)

      // Cargar todas las materias
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('year', { ascending: true })
        .order('semester', { ascending: true })

      if (subjectsError) throw subjectsError

      // Cargar los estados personalizados del usuario
      const { data: userSubjectsData, error: userSubjectsError } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user?.id)

      if (userSubjectsError) throw userSubjectsError

      // Combinar los datos
      const subjectsWithStatus = subjectsData.map(subject => ({
        ...subject,
        userStatus: userSubjectsData?.find(us => us.subject_id === subject.id)
      }))

      setSubjects(subjectsWithStatus)
    } catch (error: any) {
      console.error('Error al cargar las materias:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las materias.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (subjectId: string, newStatus: string) => {
    try {
      const subject = subjects.find(s => s.id === subjectId)
      if (!subject) return

      if (subject.userStatus) {
        // Actualizar estado existente
        const { error } = await supabase
          .from('user_subjects')
          .update({ status: newStatus })
          .eq('id', subject.userStatus.id)

        if (error) throw error
      } else {
        // Crear nuevo estado
        const { error } = await supabase
          .from('user_subjects')
          .insert({
            user_id: user?.id,
            subject_id: subjectId,
            status: newStatus
          })

        if (error) throw error
      }

      // Recargar los datos
      await loadSubjects()

      toast({
        title: "Estado actualizado",
        description: "El estado de la materia ha sido actualizado correctamente.",
      })
    } catch (error: any) {
      console.error('Error al actualizar el estado:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la materia.",
        variant: "destructive",
      })
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Por cursar'
      case 'in_progress':
        return 'En curso'
      case 'completed':
        return 'Aprobada'
      case 'pendingFinal':
        return 'Final pendiente'
      default:
        return 'Por cursar'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pendingFinal':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear === null || subject.year === selectedYear
    const matchesStatus = selectedStatus === null || subject.userStatus?.status === selectedStatus
    return matchesSearch && matchesYear && matchesStatus
  })

  const years = Array.from(new Set(subjects.map(s => s.year))).sort()

  if (!user) {
    return null // No renderizar nada mientras se redirige
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Cargando materias...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Plan de Estudios - Ingeniería en Sistemas</h1>
      
      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />
          <Select
            value={selectedYear?.toString() || "all"}
            onValueChange={(value) => setSelectedYear(value === "all" ? null : parseInt(value))}
          >
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="Filtrar por año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los años</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}° Año
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedStatus || "all"}
            onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}
          >
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Por cursar</SelectItem>
              <SelectItem value="in_progress">En curso</SelectItem>
              <SelectItem value="completed">Aprobadas</SelectItem>
              <SelectItem value="pendingFinal">Final pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de materias por año */}
      {years.map(year => {
        const yearSubjects = filteredSubjects.filter(s => s.year === year)
        if (yearSubjects.length === 0) return null

        return (
          <div key={year} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{year}° Año</h2>
            <div className="space-y-4">
              {yearSubjects.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <CardDescription>
                          {subject.code} - {subject.semester === 0 ? 'Anual' : `${subject.semester}° Cuatrimestre`}
                        </CardDescription>
                      </div>
                      <Select
                        value={subject.userStatus?.status || 'pending'}
                        onValueChange={(value) => handleStatusChange(subject.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Por cursar</SelectItem>
                          <SelectItem value="in_progress">En curso</SelectItem>
                          <SelectItem value="completed">Aprobada</SelectItem>
                          <SelectItem value="pendingFinal">Final pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(subject.userStatus?.status || 'pending')}>
                          {getStatusLabel(subject.userStatus?.status || 'pending')}
                        </Badge>
                      </div>

                      {subject.correlativas_cursado.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Correlativas para cursar:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {subject.correlativas_cursado.map((correlativaId) => {
                              const correlativa = subjects.find(s => s.id === correlativaId)
                              return (
                                <Badge key={correlativaId} variant="secondary">
                                  {correlativa?.code || correlativaId}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {subject.correlativas_final.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Correlativas para final:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {subject.correlativas_final.map((correlativaId) => {
                              const correlativa = subjects.find(s => s.id === correlativaId)
                              return (
                                <Badge key={correlativaId} variant="secondary">
                                  {correlativa?.code || correlativaId}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
} 