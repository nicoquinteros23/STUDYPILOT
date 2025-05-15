"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import SubjectForm from "./SubjectForm"

export default function SubjectDetail({ subject, existingSubjects, onUpdate, onDelete, userStatus }) {
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = (updatedSubject) => {
    onUpdate(updatedSubject)
    setIsEditing(false)
  }

  // Función para obtener los nombres de las materias a partir de sus IDs
  const getSubjectNames = (ids) => {
    if (!ids || ids.length === 0) return "Ninguno"
    return ids.map((id) => existingSubjects.find((s) => s.id === id)?.name || `ID: ${id}`).join(", ")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">{subject.name}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Materia" : "Detalles de la Materia"}</DialogTitle>
        </DialogHeader>
        {isEditing ? (
          <SubjectForm
            initialData={subject}
            existingSubjects={existingSubjects}
            onUpdate={handleUpdate}
            userStatus={userStatus}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{subject.name}</h2>
                <p className="text-muted-foreground">{subject.year}° Año</p>
              </div>
              <div className="flex gap-2">
                {subject.isElective && <Badge variant="outline">Electiva</Badge>}
                <Badge>{subject.duration === "anual" ? "Anual" : "Cuatrimestral"}</Badge>
                {subject.duration === "cuatrimestral" && (
                  <Badge variant="secondary">{subject.semester === "primero" ? "1er" : "2do"} Cuatrimestre</Badge>
                )}
                <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200">
                  Mesa {subject.examBoard || "1"}
                </Badge>
              </div>
            </div>

            {subject.commission && (
              <p>
                <strong>Comisión:</strong> {subject.commission}
              </p>
            )}

            <p>
              <strong>Profesor:</strong> {subject.professor || "No especificado"}
            </p>

            <div>
              <strong>Correlativas para cursar:</strong>{" "}
              <p className="text-sm mt-1">{getSubjectNames(subject.prerequisites)}</p>
            </div>

            <div>
              <strong>Correlativas para rendir final:</strong>{" "}
              <p className="text-sm mt-1">{getSubjectNames(subject.finalPrerequisites)}</p>
            </div>

            <div>
              <strong>Horarios:</strong>
              {subject.schedules && subject.schedules.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {subject.schedules.map((schedule, index) => (
                    <li key={index}>
                      {schedule.day} {schedule.startTime} - {schedule.endTime}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No hay horarios definidos</p>
              )}
            </div>

            <p>
              <strong>Descripción:</strong> {subject.description || "No hay descripción disponible"}
            </p>

            <div className="flex justify-between mt-4">
              <Button onClick={() => setIsEditing(true)}>Editar</Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente la materia "{subject.name}" del plan de estudios. Esta
                      acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(subject.id)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
