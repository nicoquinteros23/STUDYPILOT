"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SubjectFilter({ onFilterChange }) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    onFilterChange({ status: value, year: yearFilter })
  }

  const handleYearChange = (value) => {
    setYearFilter(value)
    onFilterChange({ status: statusFilter, year: value })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <Select onValueChange={handleStatusChange} value={statusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="notStarted">Por cursar</SelectItem>
            <SelectItem value="inProgress">Cursando</SelectItem>
            <SelectItem value="pendingFinal">Final pendiente</SelectItem>
            <SelectItem value="approved">Aprobadas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Select onValueChange={handleYearChange} value={yearFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los años</SelectItem>
            <SelectItem value="1">1° Año</SelectItem>
            <SelectItem value="2">2° Año</SelectItem>
            <SelectItem value="3">3° Año</SelectItem>
            <SelectItem value="4">4° Año</SelectItem>
            <SelectItem value="5">5° Año</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
