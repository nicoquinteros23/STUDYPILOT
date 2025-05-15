"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
// Crear intervalos de 45 minutos desde las 7:00 hasta las 22:45
const HOURS = []
for (let hour = 7; hour < 23; hour++) {
  HOURS.push(`${hour}:00`)
  if (hour < 22) {
    HOURS.push(`${hour}:45`)
  }
}

export default function AddSubjectToSchedule({ subjects, userStatus, onAddSubject }) {
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [commission, setCommission] = useState("")
  const [schedules, setSchedules] = useState([{ day: "Lunes", startTime: "8:00", endTime: "9:30" }])
  const [error, setError] = useState("")

  // Filtrar materias disponibles para cursar o que ya están en curso
  useEffect(() => {
    const filtered = subjects.filter((subject) => {
      // Incluir materias que ya están en curso
      if (userStatus[subject.id] === "inProgress") {
        return true
      }

      // Incluir materias que están disponibles para cursar (no aprobadas, no con final pendiente)
      if (userStatus[subject.id] === "approved" || userStatus[subject.id] === "pendingFinal") {
        return false
      }

      // Si no tiene prerrequisitos, está disponible
      if (!subject.prerequisites || subject.prerequisites.length === 0) {
        return true
      }

      // Todos los prerrequisitos deben estar aprobados o con final pendiente
      return subject.prerequisites.every(
        (prereqId) => userStatus[prereqId] === "approved" || userStatus[prereqId] === "pendingFinal",
      )
    })

    setAvailableSubjects(filtered)
  }, [subjects, userStatus])

  const handleAddSchedule = () => {
    setSchedules([...schedules, { day: "Lunes", startTime: "8:00", endTime: "9:30" }])
  }

  const handleRemoveSchedule = (index) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index))
    }
  }

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...schedules]
    updatedSchedules[index][field] = value
    setSchedules(updatedSchedules)
  }

  const validateSchedules = () => {
    // Verificar que las horas de fin sean posteriores a las de inicio
    for (const schedule of schedules) {
      const startIndex = HOURS.indexOf(schedule.startTime)
      const endIndex = HOURS.indexOf(schedule.endTime)
      if (endIndex <= startIndex) {
        setError("La hora de fin debe ser posterior a la hora de inicio")
        return false
      }
    }

    // Verificar superposiciones entre los horarios ingresados
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        if (schedules[i].day === schedules[j].day) {
          const startA = HOURS.indexOf(schedules[i].startTime)
          const endA = HOURS.indexOf(schedules[i].endTime)
          const startB = HOURS.indexOf(schedules[j].startTime)
          const endB = HOURS.indexOf(schedules[j].endTime)

          if (startA < endB && startB < endA) {
            setError("Hay superposición entre los horarios ingresados")
            return false
          }
        }
      }
    }

    // Verificar superposición con otras materias que está cursando
    const otherSubjects = subjects.filter(
      (s) => s.id !== selectedSubject && userStatus[s.id] === "inProgress" && s.schedules && s.schedules.length > 0,
    )

    for (const schedule of schedules) {
      for (const subject of otherSubjects) {
        for (const otherSchedule of subject.schedules) {
          if (schedule.day === otherSchedule.day) {
            const startA = HOURS.indexOf(schedule.startTime)
            const endA = HOURS.indexOf(schedule.endTime)
            const startB = HOURS.indexOf(otherSchedule.startTime)
            const endB = HOURS.indexOf(otherSchedule.endTime)

            if (startA < endB && startB < endA) {
              setError(
                `Superposición con la materia "${subject.name}" (${otherSchedule.day} ${otherSchedule.startTime}-${otherSchedule.endTime})`,
              )
              return false
            }
          }
        }
      }
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!selectedSubject) {
      setError("Debes seleccionar una materia")
      return
    }

    if (!validateSchedules()) {
      return
    }

    onAddSubject(selectedSubject, commission, schedules)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subject">Materia</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una materia" />
          </SelectTrigger>
          <SelectContent>
            {availableSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name} {userStatus[subject.id] === "inProgress" ? "(En curso)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="commission">Comisión (opcional)</Label>
        <Input
          id="commission"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          placeholder="Ej: K1051"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Horarios</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddSchedule}>
            Agregar Horario
          </Button>
        </div>

        {schedules.map((schedule, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 mb-2">
            <div>
              <Label htmlFor={`day-${index}`} className="sr-only">
                Día
              </Label>
              <Select value={schedule.day} onValueChange={(value) => handleScheduleChange(index, "day", value)}>
                <SelectTrigger id={`day-${index}`}>
                  <SelectValue placeholder="Día" />
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

            <div>
              <Label htmlFor={`start-${index}`} className="sr-only">
                Hora inicio
              </Label>
              <Select
                value={schedule.startTime}
                onValueChange={(value) => handleScheduleChange(index, "startTime", value)}
              >
                <SelectTrigger id={`start-${index}`}>
                  <SelectValue placeholder="Inicio" />
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
              <Label htmlFor={`end-${index}`} className="sr-only">
                Hora fin
              </Label>
              <Select value={schedule.endTime} onValueChange={(value) => handleScheduleChange(index, "endTime", value)}>
                <SelectTrigger id={`end-${index}`}>
                  <SelectValue placeholder="Fin" />
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

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => handleRemoveSchedule(index)}
                disabled={schedules.length <= 1}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit">Agregar Materia al Horario</Button>
      </div>
    </form>
  )
}
