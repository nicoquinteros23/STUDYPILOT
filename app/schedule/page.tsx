"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Download, Calendar, BookOpen, Loader2 } from "lucide-react"
import ScheduleGrid from "@/components/ScheduleGrid"
import AddSubjectToSchedule from "@/components/AddSubjectToSchedule"
import AddActivityToSchedule from "@/components/AddActivityToSchedule"
import { useToast } from "@/hooks/use-toast"
import { generatePDF } from "@/lib/pdf-generator"
// Importar la nueva función de exportación de imagen
import { exportAsImage } from "@/lib/image-exporter"

export default function Schedule() {
  const [subjects, setSubjects] = useState([])
  const [userStatus, setUserStatus] = useState({})
  const [activities, setActivities] = useState([])
  const [addSubjectOpen, setAddSubjectOpen] = useState(false)
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const scheduleRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    // Primero intentar cargar desde el localStorage específico de la carrera (UTN Sistemas)
    const storedCareerSubjects = localStorage.getItem("subjects-utn-sistemas")
    const storedCareerUserStatus = localStorage.getItem("userStatus-utn-sistemas")

    // Luego intentar cargar desde el localStorage general
    const storedSubjects = localStorage.getItem("subjects")
    const storedUserStatus = localStorage.getItem("userStatus")
    const storedActivities = localStorage.getItem("schedule-activities")

    if (storedCareerSubjects && storedCareerUserStatus) {
      setSubjects(JSON.parse(storedCareerSubjects))
      setUserStatus(JSON.parse(storedCareerUserStatus))
    } else if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects))
      if (storedUserStatus) setUserStatus(JSON.parse(storedUserStatus))
    }

    if (storedActivities) setActivities(JSON.parse(storedActivities))
  }, [])

  useEffect(() => {
    localStorage.setItem("schedule-activities", JSON.stringify(activities))
  }, [activities])

  const inProgressSubjects = subjects.filter((subject) => userStatus[subject.id] === "inProgress")

  const handleAddSubject = (subjectId, commission, schedules) => {
    // Actualizar el estado de la materia seleccionada
    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          commission,
          schedules,
        }
      }
      return subject
    })

    // Actualizar el estado del usuario para marcar la materia como "en curso"
    const updatedUserStatus = {
      ...userStatus,
      [subjectId]: "inProgress",
    }

    setSubjects(updatedSubjects)
    setUserStatus(updatedUserStatus)

    // Guardar en localStorage
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects))
    localStorage.setItem("userStatus", JSON.stringify(updatedUserStatus))

    // También guardar en el localStorage específico de la carrera
    localStorage.setItem("subjects-utn-sistemas", JSON.stringify(updatedSubjects))
    localStorage.setItem("userStatus-utn-sistemas", JSON.stringify(updatedUserStatus))

    setAddSubjectOpen(false)
    toast({
      title: "Materia agregada",
      description: "La materia ha sido agregada a tu horario correctamente.",
    })
  }

  const handleAddActivity = (activity) => {
    setActivities([...activities, { ...activity, id: Date.now().toString() }])
    setAddActivityOpen(false)
    toast({
      title: "Actividad agregada",
      description: "La actividad ha sido agregada a tu horario correctamente.",
    })
  }

  const handleRemoveActivity = (activityId) => {
    setActivities(activities.filter((activity) => activity.id !== activityId))
    toast({
      title: "Actividad eliminada",
      description: "La actividad ha sido eliminada de tu horario.",
    })
  }

  const handleRemoveSubjectFromSchedule = (subjectId) => {
    // Actualizar el estado de la materia seleccionada para quitar los horarios
    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          schedules: [],
        }
      }
      return subject
    })

    setSubjects(updatedSubjects)

    // Guardar en localStorage
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects))
    localStorage.setItem("subjects-utn-sistemas", JSON.stringify(updatedSubjects))

    toast({
      title: "Horario eliminado",
      description: "El horario de la materia ha sido eliminado.",
    })
  }

  const handleUpdateSubject = (subjectId, updatedSchedules) => {
    // Actualizar el estado de la materia seleccionada con los nuevos horarios
    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          schedules: updatedSchedules,
        }
      }
      return subject
    })

    setSubjects(updatedSubjects)

    // Guardar en localStorage
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects))
    localStorage.setItem("subjects-utn-sistemas", JSON.stringify(updatedSubjects))

    toast({
      title: "Horario actualizado",
      description: "El horario de la materia ha sido actualizado correctamente.",
    })
  }

  const handleUpdateActivity = (activityId, updatedSchedules) => {
    // Actualizar la actividad con los nuevos horarios
    const updatedActivities = activities.map((activity) => {
      if (activity.id === activityId) {
        return {
          ...activity,
          schedules: updatedSchedules,
        }
      }
      return activity
    })

    setActivities(updatedActivities)

    // Guardar en localStorage
    localStorage.setItem("schedule-activities", JSON.stringify(updatedActivities))

    toast({
      title: "Actividad actualizada",
      description: "El horario de la actividad ha sido actualizado correctamente.",
    })
  }

  const handleExportPDF = async () => {
    if (scheduleRef.current) {
      try {
        setIsExporting(true)
        toast({
          title: "Generando PDF",
          description: "Espera mientras se genera tu horario en PDF...",
        })

        // Pequeño retraso para asegurar que el toast se muestre antes de la generación del PDF
        setTimeout(async () => {
          try {
            await generatePDF(scheduleRef.current, "Mi_Horario_Academico")
            toast({
              title: "Horario exportado",
              description: "Tu horario ha sido exportado como PDF correctamente.",
            })
          } catch (error) {
            console.error("Error al exportar PDF:", error)
            toast({
              title: "Error al exportar",
              description: "No se pudo generar el PDF. Intenta nuevamente.",
              variant: "destructive",
            })
          } finally {
            setIsExporting(false)
          }
        }, 500)
      } catch (error) {
        console.error("Error al exportar PDF:", error)
        toast({
          title: "Error al exportar",
          description: "No se pudo generar el PDF. Intenta nuevamente.",
          variant: "destructive",
        })
        setIsExporting(false)
      }
    }
  }

  // Añadir una nueva función para exportar como imagen
  const handleExportImage = async () => {
    if (scheduleRef.current) {
      try {
        setIsExporting(true)
        toast({
          title: "Generando imagen",
          description: "Espera mientras se genera tu horario como imagen...",
        })

        // Pequeño retraso para asegurar que el toast se muestre antes de la generación
        setTimeout(async () => {
          try {
            await exportAsImage(scheduleRef.current, "Mi_Horario_Academico")
            toast({
              title: "Horario exportado",
              description: "Tu horario ha sido exportado como imagen PNG correctamente.",
            })
          } catch (error) {
            console.error("Error al exportar imagen:", error)
            toast({
              title: "Error al exportar",
              description: "No se pudo generar la imagen. Intenta nuevamente.",
              variant: "destructive",
            })
          } finally {
            setIsExporting(false)
          }
        }, 500)
      } catch (error) {
        console.error("Error al exportar imagen:", error)
        toast({
          title: "Error al exportar",
          description: "No se pudo generar la imagen. Intenta nuevamente.",
          variant: "destructive",
        })
        setIsExporting(false)
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Horario de Cursado</h1>
        <div className="flex gap-2">
          <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <BookOpen className="mr-2 h-4 w-4" />
                Agregar Materia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agregar Materia al Horario</DialogTitle>
              </DialogHeader>
              <AddSubjectToSchedule subjects={subjects} userStatus={userStatus} onAddSubject={handleAddSubject} />
            </DialogContent>
          </Dialog>

          <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Actividad
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agregar Actividad Personal</DialogTitle>
              </DialogHeader>
              <AddActivityToSchedule onAddActivity={handleAddActivity} />
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleExportImage} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PNG
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">
            <Calendar className="mr-2 h-4 w-4" />
            Grilla de Horarios
          </TabsTrigger>
          <TabsTrigger value="list">
            <BookOpen className="mr-2 h-4 w-4" />
            Lista de Materias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <Card>
            <CardHeader>
              <CardTitle>Grilla Semanal (Módulos de 45 minutos)</CardTitle>
              <CardDescription>
                Visualiza tu horario semanal completo con materias y actividades personales. Puedes arrastrar los
                bloques para moverlos y usar los controles para ajustar su duración.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div ref={scheduleRef}>
                <ScheduleGrid
                  subjects={subjects}
                  userStatus={userStatus}
                  activities={activities}
                  onRemoveActivity={handleRemoveActivity}
                  onRemoveSubject={handleRemoveSubjectFromSchedule}
                  onUpdateSubject={handleUpdateSubject}
                  onUpdateActivity={handleUpdateActivity}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Materias en Curso</CardTitle>
                <CardDescription>Listado de materias que estás cursando actualmente con sus horarios</CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressSubjects.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressSubjects.map((subject) => (
                      <Card key={subject.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                            {subject.commission && <Badge variant="outline">Com: {subject.commission}</Badge>}
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          <p>
                            <strong>Profesor:</strong> {subject.professor || "No especificado"}
                          </p>
                          <div className="mt-2">
                            <strong>Horarios:</strong>
                            {subject.schedules && subject.schedules.length > 0 ? (
                              <ul className="mt-1 space-y-1">
                                {subject.schedules.map((schedule, index) => (
                                  <li key={index} className="flex justify-between">
                                    <span>
                                      {schedule.day} {schedule.startTime} - {schedule.endTime}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() => handleRemoveSubjectFromSchedule(subject.id)}
                                    >
                                      Eliminar horario
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground">No hay horarios definidos</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tienes materias en curso actualmente.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setAddSubjectOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Materia
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividades Personales</CardTitle>
                <CardDescription>Otras actividades que has agregado a tu horario</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <Card key={activity.id} className="overflow-hidden">
                        <CardHeader className="bg-primary/10 py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{activity.name}</CardTitle>
                            <Badge>{activity.type || "Actividad"}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          {activity.description && <p className="mb-2">{activity.description}</p>}
                          <div className="mt-2">
                            <strong>Horarios:</strong>
                            <ul className="mt-1 space-y-1">
                              {activity.schedules.map((schedule, index) => (
                                <li key={index} className="flex justify-between">
                                  <span>
                                    {schedule.day} {schedule.startTime} - {schedule.endTime}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => handleRemoveActivity(activity.id)}
                                  >
                                    Eliminar
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tienes actividades personales agregadas.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setAddActivityOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Actividad
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
