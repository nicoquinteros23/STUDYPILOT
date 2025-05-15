"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

const ACTIVITY_TYPES = ["Trabajo", "Estudio", "Deporte", "Reunión", "Transporte", "Descanso", "Otro"]

export default function AddActivityToSchedule({ onAddActivity }) {
  const [name, setName] = useState("")
  const [type, setType] = useState("Otro")
  const [description, setDescription] = useState("")
  const [schedules, setSchedules] = useState([{ day: "Lunes", startTime: "8:00", endTime: "9:30" }])
  const [error, setError] = useState("")

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

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("El nombre de la actividad es obligatorio")
      return
    }

    if (!validateSchedules()) {
      return
    }

    onAddActivity({
      id: Date.now().toString(),
      name,
      type,
      description,
      schedules,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la Actividad</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Trabajo part-time"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Tipo de Actividad</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map((activityType) => (
              <SelectItem key={activityType} value={activityType}>
                {activityType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Agrega detalles sobre esta actividad"
          rows={3}
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
        <Button type="submit">Agregar Actividad</Button>
      </div>
    </form>
  )
}
