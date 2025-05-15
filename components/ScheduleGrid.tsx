"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X, Info, Clock, GripVertical, ArrowUp, ArrowDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
// Crear intervalos de 45 minutos desde las 7:00 hasta las 22:45
const HOURS = []
for (let hour = 7; hour < 23; hour++) {
  HOURS.push(`${hour}:00`)
  if (hour < 22) {
    HOURS.push(`${hour}:45`)
  }
}

const SUBJECT_COLORS = [
  "bg-blue-500 text-white",
  "bg-green-500 text-white",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
  "bg-yellow-500 text-black",
  "bg-orange-500 text-white",
  "bg-teal-500 text-white",
  "bg-indigo-500 text-white",
  "bg-red-500 text-white",
  "bg-emerald-500 text-white",
  "bg-cyan-500 text-white",
  "bg-amber-500 text-black",
  "bg-lime-500 text-black",
  "bg-rose-500 text-white",
  "bg-fuchsia-500 text-white",
]

const ACTIVITY_COLORS = [
  "bg-blue-400 text-white",
  "bg-green-400 text-white",
  "bg-purple-400 text-white",
  "bg-pink-400 text-white",
  "bg-yellow-400 text-black",
  "bg-orange-400 text-white",
  "bg-teal-400 text-white",
  "bg-indigo-400 text-white",
  "bg-red-400 text-white",
]

// Función para obtener un color consistente basado en el ID
const getItemColor = (id, type) => {
  const colors = type === "subject" ? SUBJECT_COLORS : ACTIVITY_COLORS
  // Usar el hash del ID para seleccionar un color
  const hashCode = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hashCode % colors.length]
}

export default function ScheduleGrid({
  subjects,
  userStatus,
  activities = [],
  onRemoveActivity,
  onRemoveSubject,
  onUpdateSubject,
  onUpdateActivity,
}) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editTimeOpen, setEditTimeOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverCell, setDragOverCell] = useState(null)
  const [editedStartTime, setEditedStartTime] = useState("")
  const [editedEndTime, setEditedEndTime] = useState("")
  const [editedDay, setEditedDay] = useState("")

  // Filtrar materias que el usuario está cursando
  const inProgressSubjects = subjects.filter(
    (subject) => userStatus[subject.id] === "inProgress" && subject.schedules && subject.schedules.length > 0,
  )

  // Función para convertir hora a índice en el array HOURS
  const getTimeIndex = (timeString) => {
    return HOURS.findIndex((hour) => hour === timeString)
  }

  // Preparar los datos para la grilla
  const scheduleItems = []

  // Procesar materias
  inProgressSubjects.forEach((subject) => {
    subject.schedules.forEach((schedule, scheduleIndex) => {
      const startIndex = getTimeIndex(schedule.startTime)
      const endIndex = getTimeIndex(schedule.endTime)

      if (startIndex !== -1 && endIndex !== -1) {
        scheduleItems.push({
          ...subject,
          schedule,
          scheduleIndex,
          type: "subject",
          day: schedule.day,
          startIndex,
          endIndex,
          height: endIndex - startIndex,
        })
      }
    })
  })

  // Procesar actividades
  activities.forEach((activity) => {
    activity.schedules.forEach((schedule, scheduleIndex) => {
      const startIndex = getTimeIndex(schedule.startTime)
      const endIndex = getTimeIndex(schedule.endTime)

      if (startIndex !== -1 && endIndex !== -1) {
        scheduleItems.push({
          ...activity,
          schedule,
          scheduleIndex,
          type: "activity",
          day: schedule.day,
          startIndex,
          endIndex,
          height: endIndex - startIndex,
        })
      }
    })
  })

  const handleItemClick = (item, e) => {
    // Evitar que el clic se propague si estamos arrastrando
    if (draggedItem) return

    e.stopPropagation()
    setSelectedItem(item)
    setDetailsOpen(true)
  }

  const handleRemove = () => {
    if (selectedItem) {
      if (selectedItem.type === "activity") {
        onRemoveActivity(selectedItem.id)
      } else {
        onRemoveSubject(selectedItem.id)
      }
      setDetailsOpen(false)
    }
  }

  const handleEditTime = () => {
    if (selectedItem) {
      setEditedDay(selectedItem.schedule.day)
      setEditedStartTime(selectedItem.schedule.startTime)
      setEditedEndTime(selectedItem.schedule.endTime)
      setEditTimeOpen(true)
      setDetailsOpen(false)
    }
  }

  const handleSaveTimeEdit = () => {
    if (selectedItem) {
      const startIndex = getTimeIndex(editedStartTime)
      const endIndex = getTimeIndex(editedEndTime)

      if (startIndex >= endIndex) {
        alert("La hora de fin debe ser posterior a la hora de inicio")
        return
      }

      const updatedSchedule = {
        ...selectedItem.schedule,
        day: editedDay,
        startTime: editedStartTime,
        endTime: editedEndTime,
      }

      if (selectedItem.type === "subject") {
        // Actualizar la materia
        const updatedSchedules = [...subjects.find((s) => s.id === selectedItem.id).schedules]
        updatedSchedules[selectedItem.scheduleIndex] = updatedSchedule

        onUpdateSubject(selectedItem.id, updatedSchedules)
      } else {
        // Actualizar la actividad
        const updatedSchedules = [...activities.find((a) => a.id === selectedItem.id).schedules]
        updatedSchedules[selectedItem.scheduleIndex] = updatedSchedule

        onUpdateActivity(selectedItem.id, updatedSchedules)
      }

      setEditTimeOpen(false)
    }
  }

  // Funciones para drag and drop
  const handleDragStart = (item, e) => {
    e.stopPropagation()
    setDraggedItem(item)
    // Establecer una imagen transparente para el arrastre
    const img = new Image()
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDragOver = (day, hourIndex, e) => {
    e.preventDefault()
    setDragOverCell({ day, hourIndex })
  }

  const handleDrop = (day, hourIndex, e) => {
    e.preventDefault()

    if (!draggedItem) return

    // Calcular la nueva hora de inicio basada en la celda donde se soltó
    const newStartTime = HOURS[hourIndex]
    // Mantener la misma duración
    const duration = draggedItem.endIndex - draggedItem.startIndex
    const newEndIndex = hourIndex + duration

    if (newEndIndex >= HOURS.length) {
      alert("No hay suficiente espacio en el horario para esta actividad")
      setDraggedItem(null)
      setDragOverCell(null)
      return
    }

    const newEndTime = HOURS[newEndIndex]

    const updatedSchedule = {
      ...draggedItem.schedule,
      day,
      startTime: newStartTime,
      endTime: newEndTime,
    }

    if (draggedItem.type === "subject") {
      // Actualizar la materia
      const updatedSchedules = [...subjects.find((s) => s.id === draggedItem.id).schedules]
      updatedSchedules[draggedItem.scheduleIndex] = updatedSchedule

      onUpdateSubject(draggedItem.id, updatedSchedules)
    } else {
      // Actualizar la actividad
      const updatedSchedules = [...activities.find((a) => a.id === draggedItem.id).schedules]
      updatedSchedules[draggedItem.scheduleIndex] = updatedSchedule

      onUpdateActivity(draggedItem.id, updatedSchedules)
    }

    setDraggedItem(null)
    setDragOverCell(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverCell(null)
  }

  // Función para ajustar la duración
  const handleAdjustDuration = (item, direction) => {
    const currentEndIndex = getTimeIndex(item.schedule.endTime)
    let newEndIndex = currentEndIndex

    if (direction === "increase") {
      newEndIndex = currentEndIndex + 1
      if (newEndIndex >= HOURS.length) {
        alert("No se puede extender más allá del horario disponible")
        return
      }
    } else {
      newEndIndex = currentEndIndex - 1
      const startIndex = getTimeIndex(item.schedule.startTime)
      if (newEndIndex <= startIndex) {
        alert("La duración mínima es de 45 minutos")
        return
      }
    }

    const newEndTime = HOURS[newEndIndex]

    const updatedSchedule = {
      ...item.schedule,
      endTime: newEndTime,
    }

    if (item.type === "subject") {
      // Actualizar la materia
      const updatedSchedules = [...subjects.find((s) => s.id === item.id).schedules]
      updatedSchedules[item.scheduleIndex] = updatedSchedule

      onUpdateSubject(item.id, updatedSchedules)
    } else {
      // Actualizar la actividad
      const updatedSchedules = [...activities.find((a) => a.id === item.id).schedules]
      updatedSchedules[item.scheduleIndex] = updatedSchedule

      onUpdateActivity(item.id, updatedSchedules)
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]" id="schedule-grid-container">
        <div className="grid grid-cols-7 gap-1">
          <div className="h-12"></div> {/* Celda vacía para la esquina superior izquierda */}
          {DAYS.map((day) => (
            <div key={day} className="h-12 bg-muted flex items-center justify-center font-semibold">
              {day}
            </div>
          ))}
          {HOURS.map((hour, hourIndex) => (
            <React.Fragment key={hour}>
              <div className="h-12 bg-muted flex items-center justify-center font-semibold text-sm">{hour}</div>

              {DAYS.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className={`h-12 border rounded-sm p-1 relative ${
                    dragOverCell && dragOverCell.day === day && dragOverCell.hourIndex === hourIndex
                      ? "bg-blue-100"
                      : ""
                  }`}
                  onDragOver={(e) => handleDragOver(day, hourIndex, e)}
                  onDrop={(e) => handleDrop(day, hourIndex, e)}
                >
                  {scheduleItems
                    .filter((item) => item.day === day && item.startIndex === hourIndex)
                    .map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className={`text-xs p-1 rounded cursor-move absolute top-0 left-0 right-0 overflow-hidden ${getItemColor(
                          item.id,
                          item.type,
                        )} ${draggedItem && draggedItem.id === item.id && draggedItem.scheduleIndex === item.scheduleIndex ? "opacity-50" : ""}`}
                        style={{
                          height: `${item.height * 48}px`, // 48px = 12px (altura base) * 4 (para que ocupe todo el espacio)
                          zIndex: 10,
                        }}
                        onClick={(e) => handleItemClick(item, e)}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(item, e)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-semibold truncate">{item.name}</div>
                          <GripVertical className="h-3 w-3 opacity-70" />
                        </div>
                        {item.type === "subject" && item.commission && (
                          <div className="truncate text-[10px]">Com: {item.commission}</div>
                        )}
                        <div className="truncate text-[10px]">
                          {item.schedule.startTime} - {item.schedule.endTime}
                        </div>

                        {/* Controles para ajustar duración */}
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                          <button
                            className="bg-white bg-opacity-30 rounded-full p-0.5 hover:bg-opacity-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdjustDuration(item, "increase")
                            }}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            className="bg-white bg-opacity-30 rounded-full p-0.5 hover:bg-opacity-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdjustDuration(item, "decrease")
                            }}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {selectedItem?.type === "subject" ? "Detalles de la Materia" : "Detalles de la Actividad"}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                {selectedItem.type === "subject" && (
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.year}° año -{" "}
                    {selectedItem.commission ? `Comisión ${selectedItem.commission}` : "Sin comisión"}
                  </p>
                )}
                {selectedItem.type === "activity" && selectedItem.type && (
                  <p className="text-sm text-muted-foreground">Tipo: {selectedItem.type}</p>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <h4 className="font-medium">Descripción</h4>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.type === "subject" && selectedItem.professor && (
                <div>
                  <h4 className="font-medium">Profesor</h4>
                  <p className="text-sm">{selectedItem.professor}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium">Horario</h4>
                <p className="text-sm">
                  {selectedItem.schedule.day} de {selectedItem.schedule.startTime} a {selectedItem.schedule.endTime}
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handleEditTime}>
                  <Clock className="h-4 w-4 mr-2" />
                  Editar Horario
                </Button>

                <Button variant="destructive" size="sm" onClick={handleRemove}>
                  <X className="h-4 w-4 mr-2" />
                  {selectedItem.type === "subject" ? "Eliminar Horario" : "Eliminar Actividad"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editTimeOpen} onOpenChange={setEditTimeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Horario</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="day">Día</Label>
              <Select value={editedDay} onValueChange={setEditedDay}>
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
                <Select value={editedStartTime} onValueChange={setEditedStartTime}>
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
                <Select value={editedEndTime} onValueChange={setEditedEndTime}>
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
            <Button variant="outline" onClick={() => setEditTimeOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTimeEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
