"use client"

import { useState, type FormEvent, useRef } from "react"
import { useStudyPlan } from "@/contexts/StudyPlanContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Trash2, Edit2, Check, XCircle } from "lucide-react"
import type { Subject } from "@/types/database"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface PreviewSubject extends Omit<Subject, "id" | "created_at"> {
  isNew?: boolean
  isModified?: boolean
  isDeleted?: boolean
}

interface RawSubject {
  id: string
  nombre: string
  anio: number
  correlativasCursado: string[]
  correlativasFinal: string[]
}

export default function AdminSubjectsPage() {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [year, setYear] = useState("")
  const [semester, setSemester] = useState("")
  const [correlativasCursado, setCorrelativasCursado] = useState<string[]>([])
  const [correlativasFinal, setCorrelativasFinal] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { subjects, addSubject, refreshSubjects } = useStudyPlan()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para la vista previa
  const [previewSubjects, setPreviewSubjects] = useState<PreviewSubject[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [editingSubject, setEditingSubject] = useState<PreviewSubject | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({})

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addSubject({
        code,
        name,
        year: parseInt(year),
        credits: 0, // Valor por defecto ya que no se usa
        semester: parseInt(semester),
        correlativas_cursado: correlativasCursado,
        correlativas_final: correlativasFinal,
      })

      toast({
        title: "Materia agregada",
        description: "La materia ha sido agregada correctamente.",
      })

      setCode("")
      setName("")
      setYear("")
      setSemester("")
      setCorrelativasCursado([])
      setCorrelativasFinal([])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar la materia.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSemesterLabel = (semester: number) => {
    switch (semester) {
      case 0:
        return "Anual"
      case 1:
        return "1er Cuatrimestre"
      case 2:
        return "2do Cuatrimestre"
      default:
        return "Desconocido"
    }
  }

  const validateSubject = (subject: PreviewSubject): string[] => {
    const errors: string[] = []
    if (!subject.code) errors.push("El código es obligatorio")
    if (!subject.name) errors.push("El nombre es obligatorio")
    if (!subject.year || subject.year < 1 || subject.year > 5) errors.push("El año debe estar entre 1 y 5")
    if (subject.semester < 0 || subject.semester > 2) errors.push("El semestre debe ser 0 (Anual), 1 o 2")
    return errors
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      console.log("Iniciando carga de archivo:", file.name)
      
      // Leer el contenido del archivo
      const text = await file.text()
      console.log("Contenido del archivo:", text)

      if (!text) {
        throw new Error("El archivo está vacío")
      }

      // Intentar limpiar el contenido antes de parsear
      const cleanText = text.trim()
      console.log("Texto limpio:", cleanText)
      
      let rawSubjects: RawSubject[]
      try {
        rawSubjects = JSON.parse(cleanText)
        console.log("JSON parseado:", rawSubjects)
      } catch (parseError: unknown) {
        console.error("Error al parsear JSON:", parseError)
        const errorMessage = parseError instanceof Error ? parseError.message : "Error desconocido al parsear JSON"
        throw new Error(`Error al parsear el JSON: ${errorMessage}`)
      }

      if (!Array.isArray(rawSubjects)) {
        console.error("El JSON no es un array:", rawSubjects)
        throw new Error("El JSON debe ser un array de materias")
      }

      console.log("Número de materias encontradas:", rawSubjects.length)

      // Validar la estructura de cada materia
      rawSubjects.forEach((subject, index) => {
        console.log(`Validando materia ${index + 1}:`, subject)
        if (!subject.id || !subject.nombre || typeof subject.anio !== 'number') {
          throw new Error(`Materia en posición ${index + 1} no tiene la estructura correcta: ${JSON.stringify(subject)}`)
        }
      })

      // Mapear los campos del JSON al formato esperado
      const subjects = rawSubjects.map((subject: RawSubject) => {
        console.log("Mapeando materia:", subject)
        return {
          code: subject.id,
          name: subject.nombre,
          year: subject.anio,
          semester: 1, // Por defecto, se puede editar después
          credits: 0,
          correlativas_cursado: subject.correlativasCursado || [],
          correlativas_final: subject.correlativasFinal || [],
        }
      })

      console.log("Materias mapeadas:", subjects)

      // Convertir a formato de vista previa
      const previewData = subjects.map(subject => ({
        ...subject,
        isNew: true,
        isModified: false,
        isDeleted: false
      }))

      console.log("Datos de vista previa:", previewData)

      setPreviewSubjects(previewData)
      setIsPreviewMode(true)
      validateAllSubjects(previewData)
    } catch (error: unknown) {
      console.error("Error completo:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el archivo"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const validateAllSubjects = (subjects: PreviewSubject[]) => {
    const errors: { [key: string]: string[] } = {}
    subjects.forEach((subject, index) => {
      const subjectErrors = validateSubject(subject)
      if (subjectErrors.length > 0) {
        errors[index] = subjectErrors
      }
    })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEditSubject = (subject: PreviewSubject) => {
    setEditingSubject(subject)
  }

  const handleUpdateSubject = (updatedSubject: PreviewSubject) => {
    setPreviewSubjects(prev => 
      prev.map(subject => 
        subject.code === updatedSubject.code ? { ...updatedSubject, isModified: true } : subject
      )
    )
    setEditingSubject(null)
    validateAllSubjects(previewSubjects)
  }

  const handleDeleteSubject = (subjectCode: string) => {
    setPreviewSubjects(prev =>
      prev.map(subject =>
        subject.code === subjectCode ? { ...subject, isDeleted: true } : subject
      )
    )
  }

  const handleAddNewSubject = () => {
    const newSubject: PreviewSubject = {
      code: "",
      name: "",
      year: 1,
      semester: 1,
      credits: 0,
      correlativas_cursado: [],
      correlativas_final: [],
      isNew: true,
      isModified: false,
      isDeleted: false
    }
    setPreviewSubjects(prev => [...prev, newSubject])
    setEditingSubject(newSubject)
  }

  const handleConfirmUpload = async () => {
    if (!validateAllSubjects(previewSubjects)) {
      toast({
        title: "Error de validación",
        description: "Hay errores en los datos. Por favor, corrígelos antes de continuar.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const handleFinalUpload = async () => {
    try {
      const subjectsToUpload = previewSubjects
        .filter(subject => !subject.isDeleted)
        .map(({ isNew, isModified, isDeleted, ...subject }) => subject)

      console.log("Intentando subir materias:", subjectsToUpload)

      const { data, error } = await supabase
        .from("subjects")
        .insert(subjectsToUpload)
        .select()

      if (error) {
        console.error("Error detallado de Supabase:", error)
        throw new Error(`Error al importar materias: ${error.message} (${error.code})`)
      }

      console.log("Materias subidas exitosamente:", data)

      await refreshSubjects()
      setIsPreviewMode(false)
      setPreviewSubjects([])
      setShowConfirmDialog(false)

      toast({
        title: "Éxito",
        description: "Las materias han sido importadas correctamente.",
      })
    } catch (error: unknown) {
      console.error("Error completo al importar:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al importar materias"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(subjects, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    
    const exportFileDefaultName = 'materias.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const addCorrelativaCursado = (subjectId: string) => {
    if (!correlativasCursado.includes(subjectId)) {
      setCorrelativasCursado([...correlativasCursado, subjectId])
    }
  }

  const addCorrelativaFinal = (subjectId: string) => {
    if (!correlativasFinal.includes(subjectId)) {
      setCorrelativasFinal([...correlativasFinal, subjectId])
    }
  }

  const removeCorrelativaCursado = (subjectId: string) => {
    setCorrelativasCursado(correlativasCursado.filter(id => id !== subjectId))
  }

  const removeCorrelativaFinal = (subjectId: string) => {
    setCorrelativasFinal(correlativasFinal.filter(id => id !== subjectId))
  }

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || subjectId
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Administrar Materias</h1>
      
      {!isPreviewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Materia</CardTitle>
              <CardDescription>Ingresa los datos de la nueva materia</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Código"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Año"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    disabled={isLoading}
                    min="1"
                    max="5"
                  />
                </div>
                <div className="space-y-2">
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Anual</SelectItem>
                      <SelectItem value="1">1er Cuatrimestre</SelectItem>
                      <SelectItem value="2">2do Cuatrimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Correlativas para Cursar</label>
                  <Select onValueChange={addCorrelativaCursado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {correlativasCursado.map((subjectId) => (
                      <Badge key={subjectId} variant="secondary">
                        {getSubjectName(subjectId)}
                        <button
                          type="button"
                          onClick={() => removeCorrelativaCursado(subjectId)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Correlativas para Final</label>
                  <Select onValueChange={addCorrelativaFinal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {correlativasFinal.map((subjectId) => (
                      <Badge key={subjectId} variant="secondary">
                        {getSubjectName(subjectId)}
                        <button
                          type="button"
                          onClick={() => removeCorrelativaFinal(subjectId)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Agregando..." : "Agregar Materia"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materias Existentes</CardTitle>
              <CardDescription>Lista de todas las materias disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Importar JSON
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={handleExport}
                  >
                    Exportar JSON
                  </Button>
                </div>

                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{subject.name}</h3>
                        <p className="text-sm text-gray-500">
                          {subject.code} - Año {subject.year} - {getSemesterLabel(subject.semester)}
                        </p>
                        {subject.correlativas_cursado.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Correlativas para cursar:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {subject.correlativas_cursado.map((correlativaId) => (
                                <Badge key={correlativaId} variant="secondary">
                                  {getSubjectName(correlativaId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {subject.correlativas_final.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Correlativas para final:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {subject.correlativas_final.map((correlativaId) => (
                                <Badge key={correlativaId} variant="secondary">
                                  {getSubjectName(correlativaId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa de Importación</CardTitle>
            <CardDescription>Revisa y edita las materias antes de importarlas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  onClick={handleAddNewSubject}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Materia
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewMode(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmUpload}
                    disabled={Object.keys(validationErrors).length > 0}
                  >
                    Confirmar Carga
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Correlativas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewSubjects.map((subject, index) => (
                    <TableRow
                      key={subject.code}
                      className={subject.isDeleted ? "opacity-50" : ""}
                    >
                      <TableCell>
                        {subject.isNew && <Badge variant="secondary">Nueva</Badge>}
                        {subject.isModified && <Badge variant="outline">Modificada</Badge>}
                        {subject.isDeleted && <Badge variant="destructive">Eliminada</Badge>}
                      </TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.year}</TableCell>
                      <TableCell>{getSemesterLabel(subject.semester)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {subject.correlativas_cursado.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Cursar: </span>
                              {subject.correlativas_cursado.join(", ")}
                            </div>
                          )}
                          {subject.correlativas_final.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Final: </span>
                              {subject.correlativas_final.join(", ")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSubject(subject)}
                            disabled={subject.isDeleted}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSubject(subject.code)}
                            disabled={subject.isDeleted}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {Object.keys(validationErrors).length > 0 && (
                <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="font-medium text-red-800 mb-2">Errores de validación:</h3>
                  <ul className="list-disc list-inside">
                    {Object.entries(validationErrors).map(([index, errors]) => (
                      <li key={index} className="text-red-600">
                        Materia {previewSubjects[parseInt(index)].code}: {errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Materia</DialogTitle>
            <DialogDescription>
              Modifica los datos de la materia
            </DialogDescription>
          </DialogHeader>
          {editingSubject && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código</label>
                <Input
                  value={editingSubject.code}
                  onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Año</label>
                <Input
                  type="number"
                  value={editingSubject.year}
                  onChange={(e) => setEditingSubject({ ...editingSubject, year: parseInt(e.target.value) })}
                  min="1"
                  max="5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semestre</label>
                <Select
                  value={editingSubject.semester.toString()}
                  onValueChange={(value) => setEditingSubject({ ...editingSubject, semester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Anual</SelectItem>
                    <SelectItem value="1">1er Cuatrimestre</SelectItem>
                    <SelectItem value="2">2do Cuatrimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubject(null)}>
              Cancelar
            </Button>
            <Button onClick={() => editingSubject && handleUpdateSubject(editingSubject)}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Importación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas importar las siguientes materias?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <p>Total de materias a importar: {previewSubjects.filter(s => !s.isDeleted).length}</p>
              <p>Materias nuevas: {previewSubjects.filter(s => s.isNew && !s.isDeleted).length}</p>
              <p>Materias modificadas: {previewSubjects.filter(s => s.isModified && !s.isDeleted).length}</p>
              <p>Materias eliminadas: {previewSubjects.filter(s => s.isDeleted).length}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFinalUpload}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 