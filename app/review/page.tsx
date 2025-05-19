"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, BookOpen, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import CorrelativityAnalysis from "@/components/CorrelativityAnalysis"

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

// Función para normalizar los datos de correlativas
function normalizeCorrelativas(subjects: any[]): Subject[] {
  return subjects.map(subject => {
    // Log para detectar problemas en los datos
    if (!Array.isArray(subject.correlativas_cursado)) {
      console.warn(`Materia ${subject.id} (${subject.name}) tiene correlativas_cursado inválido:`, subject.correlativas_cursado);
    }
    if (!Array.isArray(subject.correlativas_final)) {
      console.warn(`Materia ${subject.id} (${subject.name}) tiene correlativas_final inválido:`, subject.correlativas_final);
    }

    // Normalizar los campos de correlativas
    return {
      ...subject,
      correlativas_cursado: Array.isArray(subject.correlativas_cursado) 
        ? subject.correlativas_cursado 
        : subject.correlativas_cursado 
          ? [subject.correlativas_cursado] 
          : [],
      correlativas_final: Array.isArray(subject.correlativas_final)
        ? subject.correlativas_final
        : subject.correlativas_final
          ? [subject.correlativas_final]
          : []
    };
  });
}

export default function ReviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<SubjectWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pendingFinal: 0,
    inProgress: 0,
    notStarted: 0,
    averageGrade: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadSubjects()
  }, [user, router])

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

      // Normalizar los datos de correlativas
      const normalizedSubjects = normalizeCorrelativas(subjectsData || []);

      // Cargar los estados personalizados del usuario
      const { data: userSubjectsData, error: userSubjectsError } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user?.id)

      if (userSubjectsError) throw userSubjectsError

      // Combinar los datos
      const subjectsWithStatus = normalizedSubjects.map(subject => ({
        ...subject,
        userStatus: userSubjectsData?.find(us => us.subject_id === subject.id)
      }))

      setSubjects(subjectsWithStatus)

      // Calcular estadísticas
      const stats = {
        total: subjectsWithStatus.length,
        approved: subjectsWithStatus.filter(s => s.userStatus?.status === 'completed').length,
        pendingFinal: subjectsWithStatus.filter(s => s.userStatus?.status === 'pendingFinal').length,
        inProgress: subjectsWithStatus.filter(s => s.userStatus?.status === 'in_progress').length,
        notStarted: subjectsWithStatus.filter(s => !s.userStatus || s.userStatus.status === 'pending').length,
        averageGrade: 0,
      }

      // Calcular promedio de notas
      const grades = subjectsWithStatus
        .filter(s => s.userStatus?.status === 'completed' && s.userStatus.grade)
        .map(s => s.userStatus?.grade || 0)
      
      if (grades.length > 0) {
        stats.averageGrade = grades.reduce((a, b) => a + b, 0) / grades.length
      }

      setStats(stats)
    } catch (error: any) {
      console.error('Error al cargar las materias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Cargando...</div>
  }

  const progressPercentage = (stats.approved / stats.total) * 100

  // Extraer userSubjects para pasar como prop
  const userSubjects = subjects
    .filter(s => s.userStatus)
    .map(s => ({
      ...s.userStatus!
    }))

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Resumen de Progreso</h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progreso Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.approved} de {stats.total} materias aprobadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Finales Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFinal}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.pendingFinal === 0 ? "¡No tienes finales pendientes!" : "Materias con final pendiente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Materias en Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.inProgress === 0 ? "No estás cursando materias" : "Materias en curso actualmente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.averageGrade === 0 ? "No hay notas registradas" : "Promedio de materias aprobadas"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con información detallada */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="pending">Finales Pendientes</TabsTrigger>
          <TabsTrigger value="inProgress">En Curso</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="correlatividades">Análisis de Correlatividades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Vista General del Plan de Estudios</CardTitle>
              <CardDescription>Resumen de tu progreso por año</CardDescription>
            </CardHeader>
            <CardContent>
              {Array.from(new Set(subjects.map(s => s.year))).sort().map(year => {
                const yearSubjects = subjects.filter(s => s.year === year)
                const yearStats = {
                  total: yearSubjects.length,
                  approved: yearSubjects.filter(s => s.userStatus?.status === 'completed').length,
                  pendingFinal: yearSubjects.filter(s => s.userStatus?.status === 'pendingFinal').length,
                  inProgress: yearSubjects.filter(s => s.userStatus?.status === 'in_progress').length,
                }
                const yearProgress = (yearStats.approved / yearStats.total) * 100

                return (
                  <div key={year} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">{year}° Año</h3>
                      <Badge variant="outline">{yearProgress.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={yearProgress} className="mb-2" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Aprobadas:</span>{" "}
                        <span className="font-medium">{yearStats.approved}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Final Pendiente:</span>{" "}
                        <span className="font-medium">{yearStats.pendingFinal}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">En Curso:</span>{" "}
                        <span className="font-medium">{yearStats.inProgress}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Finales Pendientes</CardTitle>
              <CardDescription>Materias que requieren rendir final</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.pendingFinal === 0 ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>¡Felicitaciones!</AlertTitle>
                  <AlertDescription>No tienes finales pendientes.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {subjects
                    .filter(s => s.userStatus?.status === 'pendingFinal')
                    .map(subject => (
                      <div
                        key={subject.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/20"
                      >
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.code} - {subject.year}° Año
                          </p>
                        </div>
                        <Badge variant="secondary">Final Pendiente</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inProgress">
          <Card>
            <CardHeader>
              <CardTitle>Materias en Curso</CardTitle>
              <CardDescription>Materias que estás cursando actualmente</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.inProgress === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No hay materias en curso</AlertTitle>
                  <AlertDescription>No estás cursando ninguna materia actualmente.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {subjects
                    .filter(s => s.userStatus?.status === 'in_progress')
                    .map(subject => (
                      <div
                        key={subject.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20"
                      >
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.code} - {subject.year}° Año
                          </p>
                        </div>
                        <Badge variant="secondary">En Curso</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Materias Aprobadas</CardTitle>
              <CardDescription>Materias que has aprobado</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.approved === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No hay materias aprobadas</AlertTitle>
                  <AlertDescription>Aún no has aprobado ninguna materia.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {subjects
                    .filter(s => s.userStatus?.status === 'completed')
                    .map(subject => (
                      <div
                        key={subject.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-green-50 dark:bg-green-900/20"
                      >
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.code} - {subject.year}° Año
                            {subject.userStatus?.grade && ` - Nota: ${subject.userStatus.grade}`}
                          </p>
                        </div>
                        <Badge variant="secondary">Aprobada</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlatividades">
          <CorrelativityAnalysis subjects={subjects} userSubjects={userSubjects} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 