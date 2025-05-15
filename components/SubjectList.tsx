"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import SubjectDetail from "./SubjectDetail"
import SubjectFilter from "./SubjectFilter"

export default function SubjectList({ subjects, userStatus, updateUserStatus, updateSubject, deleteSubject }) {
  const [filters, setFilters] = useState({ status: "all", year: "all" })

  // Agrupar materias por año
  const subjectsByYear = subjects.reduce((acc, subject) => {
    const year = subject.year || "1"
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(subject)
    return acc
  }, {})

  // Ordenar los años
  const sortedYears = Object.keys(subjectsByYear).sort()

  // Aplicar filtros
  const filteredSubjectsByYear = {}
  sortedYears.forEach((year) => {
    // Filtrar por año si es necesario
    if (filters.year !== "all" && year !== filters.year) {
      return
    }

    // Filtrar por estado
    const filteredSubjects = subjectsByYear[year].filter((subject) => {
      const status = userStatus[subject.id] || "notStarted"
      return filters.status === "all" || status === filters.status
    })

    if (filteredSubjects.length > 0) {
      filteredSubjectsByYear[year] = filteredSubjects
    }
  })

  const filteredYears = Object.keys(filteredSubjectsByYear).sort()

  // Función para obtener el nombre del estado
  const getStatusName = (status) => {
    switch (status) {
      case "notStarted":
        return "Por cursar"
      case "inProgress":
        return "Cursando"
      case "pendingFinal":
        return "Final pendiente"
      case "approved":
        return "Aprobada"
      default:
        return "Desconocido"
    }
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "notStarted":
        return "outline"
      case "inProgress":
        return "secondary"
      case "pendingFinal":
        return "default"
      case "approved":
        return "success"
      default:
        return "outline"
    }
  }

  return (
    <div>
      <SubjectFilter onFilterChange={setFilters} />

      {filteredYears.length > 0 ? (
        <Accordion type="multiple" defaultValue={filteredYears}>
          {filteredYears.map((year) => (
            <AccordionItem key={year} value={year}>
              <AccordionTrigger>
                <span className="text-lg font-medium">{year}° Año</span>
                <Badge className="ml-2">{filteredSubjectsByYear[year].length}</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 mt-2">
                  {filteredSubjectsByYear[year].map((subject, index) => (
                    <li key={subject.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <SubjectDetail
                          subject={subject}
                          existingSubjects={subjects}
                          onUpdate={updateSubject}
                          onDelete={deleteSubject}
                          userStatus={userStatus}
                        />
                        {subject.isElective && (
                          <Badge variant="outline" className="ml-2">
                            Electiva
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(userStatus[subject.id] || "notStarted")}>
                          {getStatusName(userStatus[subject.id] || "notStarted")}
                        </Badge>
                        <Select
                          onValueChange={(value) => updateUserStatus(subject.id, value)}
                          value={userStatus[subject.id] || "notStarted"}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="notStarted">Por cursar</SelectItem>
                            <SelectItem value="inProgress">Cursando</SelectItem>
                            <SelectItem value="pendingFinal">Final pendiente</SelectItem>
                            <SelectItem value="approved">Aprobada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-muted-foreground">No hay materias que coincidan con los filtros seleccionados.</p>
      )}
    </div>
  )
}
