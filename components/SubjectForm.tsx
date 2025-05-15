"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
// Crear intervalos de 45 minutos desde las 7:00 hasta las 22:45
const HOURS = []
for (let hour = 7; hour < 23; hour++) {
  HOURS.push(`${hour}:00`)
  if (hour < 22) {
    HOURS.push(`${hour}:45`)
  }
}

export default function SubjectForm({
  addSubject,
  existingSubjects,
  initialData = null,
  onUpdate = null,
  userStatus = {},
}) {
  const [subject, setSubject] = useState(
    initialData || {
      id: "",
      name: "",
      prerequisites: [], // Correlativas para cursado
      finalPrerequisites: [], // Correlativas para rendir final
      professor: "",
      schedules: [],
      duration: "cuatrimestral",
      semester: "primero",
      description: "",
      year: "1",
      isElective: false,
      commission: "",
    },
  )

  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState({ day: "Lunes", startTime: "8:00", endTime: "8:45" })
  const [scheduleError, setScheduleError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (subject.name) {
      if (initialData) {
        onUpdate(subject)
      } else {
        addSubject({ ...subject, id: Date.now().toString() })
      }
      if (!initialData) {
        setSubject({
          id: "",
          name: "",
          prerequisites: [],
          finalPrerequisites: [],
          professor: "",
          schedules: [],
          duration: "cuatrimestral",
          semester: "primero",
          description: "",
          year: "1",
          isElective: false,
          commission: "",
        })
      }
    }
  }

  const handleChange = (field, value) => {
    setSubject((prev) => ({ ...prev, [field]: value }))
  }

  const addSchedule = () => {
    // Validar que la hora de fin sea posterior a la hora de inicio
    const startIndex = HOURS.indexOf(currentSchedule.startTime)
    const endIndex = HOURS.indexOf(currentSchedule.endTime)

    if (endIndex <= startIndex) {
      setScheduleError("La hora de fin debe ser posterior a la hora de inicio")
      return
    }

    // Verificar superposición con otras materias que está cursando
    const conflictingSubjects = existingSubjects.filter((s) => {
      // Solo verificar materias que el usuario está cursando
      if (userStatus[s.id] !== "inProgress") return false

      // Verificar si hay superposición de horarios
      return (
        s.schedules &&
        s.schedules.some((sch) => {
          if (sch.day !== currentSchedule.day) return false

          const schStartIndex = HOURS.indexOf(sch.startTime)
          const schEndIndex = HOURS.indexOf(sch.endTime)

          // Hay superposición si:
          // - La hora de inicio está dentro del rango de otro horario
          // - La hora de fin está dentro del rango de otro horario
          // - El horario completo contiene a otro horario
          return (
            (startIndex >= schStartIndex && startIndex < schEndIndex) ||
            (endIndex > schStartIndex && endIndex <= schEndIndex) ||
            (startIndex <= schStartIndex && endIndex >= schEndIndex)
          )
        })
      )
    })

    if (conflictingSubjects.length > 0) {
      setScheduleError(`Superposición con: ${conflictingSubjects.map((s) => s.name).join(", ")}`)
      return
    }

    // Agregar el horario
    setSubject((prev) => ({
      ...prev,
      schedules: [...(prev.schedules || []), { ...currentSchedule }],
    }))

    setScheduleError("")
    setShowScheduleDialog(false)
  }

  const removeSchedule = (index) => {
    setSubject((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subjectName">Nombre de la Materia</Label>
        <Input
          id="subjectName"
          value={subject.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ingrese el nombre de la materia"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Año</Label>
          <Select onValueChange={(value) => handleChange("year", value)} value={subject.year}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1° Año</SelectItem>
              <SelectItem value="2">2° Año</SelectItem>
              <SelectItem value="3">3° Año</SelectItem>
              <SelectItem value="4">4° Año</SelectItem>
              <SelectItem value="5">5° Año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="isElective"
            checked={subject.isElective}
            onCheckedChange={(checked) => handleChange("isElective", checked)}
          />
          <Label htmlFor="isElective">Materia Electiva</Label>
        </div>
      </div>

      <div>
        <Label>Correlatividades</Label>
        <Tabs defaultValue="cursado" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="cursado" className="flex-1">
              Para Cursar
            </TabsTrigger>
            <TabsTrigger value="final" className="flex-1">
              Para Rendir Final
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cursado" className="pt-4">
            <Label htmlFor="prerequisites">Materias necesarias para cursar</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Estas materias deben estar al menos cursadas (con final pendiente)
            </p>
            <Select
              onValueChange={(value) => {
                // Si ya es un array, usarlo; si no, crear un nuevo array con el valor
                const newValue = Array.isArray(value) ? value : [value]
                handleChange("prerequisites", newValue)
              }}
              value={subject.prerequisites || []}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione prerrequisitos para cursar" />
              </SelectTrigger>
              <SelectContent>
                {existingSubjects
                  .filter((s) => s.id !== subject.id) // Evitar que una materia sea prerrequisito de sí misma
                  .map((s) => (
                    <SelectItem key={`cursado-${s.id}`} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {subject.prerequisites && subject.prerequisites.length > 0 && (
              <div className="mt-2 p-2 border rounded-md">
                <p className="font-medium mb-1">Materias seleccionadas:</p>
                <ul className="list-disc list-inside">
                  {subject.prerequisites.map((prereqId) => {
                    const prereq = existingSubjects.find((s) => s.id === prereqId)
                    return (
                      <li key={`cursado-list-${prereqId}`} className="text-sm">
                        {prereq ? prereq.name : `ID: ${prereqId}`}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="final" className="pt-4">
            <Label htmlFor="finalPrerequisites">Materias necesarias para rendir final</Label>
            <p className="text-sm text-muted-foreground mb-2">Estas materias deben estar completamente aprobadas</p>
            <Select
              onValueChange={(value) => {
                // Si ya es un array, usarlo; si no, crear un nuevo array con el valor
                const newValue = Array.isArray(value) ? value : [value]
                handleChange("finalPrerequisites", newValue)
              }}
              value={subject.finalPrerequisites || []}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione prerrequisitos para final" />
              </SelectTrigger>
              <SelectContent>
                {existingSubjects
                  .filter((s) => s.id !== subject.id) // Evitar que una materia sea prerrequisito de sí misma
                  .map((s) => (
                    <SelectItem key={`final-${s.id}`} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {subject.finalPrerequisites && subject.finalPrerequisites.length > 0 && (
              <div className="mt-2 p-2 border rounded-md">
                <p className="font-medium mb-1">Materias seleccionadas:</p>
                <ul className="list-disc list-inside">
                  {subject.finalPrerequisites.map((prereqId) => {
                    const prereq = existingSubjects.find((s) => s.id === prereqId)
                    return (
                      <li key={`final-list-${prereqId}`} className="text-sm">
                        {prereq ? prereq.name : `ID: ${prereqId}`}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <Label htmlFor="professor">Profesor</Label>
        <Input
          id="professor"
          value={subject.professor}
          onChange={(e) => handleChange("professor", e.target.value)}
          placeholder="Ingrese el nombre del profesor"
        />
      </div>

      <div>
        <Label htmlFor="commission">Comisión</Label>
        <Input
          id="commission"
          value={subject.commission}
          onChange={(e) => handleChange("commission", e.target.value)}
          placeholder="Ej: K1051"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Horarios</Label>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Agregar Horario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Horario</DialogTitle>
              </DialogHeader>

              {scheduleError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{scheduleError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="day">Día</Label>
                  <Select
                    onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, day: value })}
                    value={currentSchedule.day}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el día" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Hora de inicio</Label>
                    <Select
                      onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, startTime: value })}
                      value={currentSchedule.startTime}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hora inicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={`start-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="endTime">Hora de fin</Label>
                    <Select
                      onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, endTime: value })}
                      value={currentSchedule.endTime}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hora fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={`end-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={addSchedule}>
                  Agregar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-md p-2">
          {subject.schedules && subject.schedules.length > 0 ? (
            <ul className="space-y-2">
              {subject.schedules.map((schedule, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {schedule.day} {schedule.startTime} - {schedule.endTime}
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSchedule(index)}>
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No hay horarios definidos</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="duration">Duración</Label>
        <Select onValueChange={(value) => handleChange("duration", value)} value={subject.duration}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione la duración" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anual">Anual</SelectItem>
            <SelectItem value="cuatrimestral">Cuatrimestral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {subject.duration === "cuatrimestral" && (
        <div>
          <Label htmlFor="semester">Cuatrimestre</Label>
          <Select onValueChange={(value) => handleChange("semester", value)} value={subject.semester}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el cuatrimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primero">Primero</SelectItem>
              <SelectItem value="segundo">Segundo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="examBoard">Mesa de Examen</Label>
        <Select onValueChange={(value) => handleChange("examBoard", value)} value={subject.examBoard || "1"}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione la mesa de examen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Mesa 1</SelectItem>
            <SelectItem value="2">Mesa 2</SelectItem>
            <SelectItem value="3">Mesa 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={subject.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Ingrese una descripción de la materia"
        />
      </div>

      <Button type="submit">{initialData ? "Actualizar Materia" : "Agregar Materia"}</Button>
    </form>
  )
}
