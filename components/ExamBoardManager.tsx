"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipo para las fechas de mesas de examen
type ExamBoardDate = {
  id: string
  boardNumber: string
  startDate: Date
  endDate: Date
  description?: string
}

// Tipo para las materias con información de mesa
type SubjectWithBoard = {
  id: string
  name: string
  year: string
  examBoard: string
  status?: string
}

export default function ExamBoardManager({ subjects, userStatus }) {
  const [examBoardDates, setExamBoardDates] = useState<ExamBoardDate[]>([])
  const [newExamBoard, setNewExamBoard] = useState<Partial<ExamBoardDate>>({
    boardNumber: "1",
    startDate: new Date(),
    endDate: new Date(),
    description: "",
  })
  const [activeTab, setActiveTab] = useState("upcoming")
  const [editingId, setEditingId] = useState<string | null>(null)

  // Cargar fechas de mesas de examen desde localStorage
  useEffect(() => {
    const storedDates = localStorage.getItem("exam-board-dates")
    if (storedDates) {
      try {
        const parsedDates = JSON.parse(storedDates)
        // Convertir strings de fecha a objetos Date
        const datesWithProperDates = parsedDates.map((date) => ({
          ...date,
          startDate: new Date(date.startDate),
          endDate: new Date(date.endDate),
        }))
        setExamBoardDates(datesWithProperDates)
      } catch (error) {
        console.error("Error parsing exam board dates:", error)
      }
    }
  }, [])

  // Guardar fechas en localStorage cuando cambien
  useEffect(() => {
    if (examBoardDates.length > 0) {
      localStorage.setItem("exam-board-dates", JSON.stringify(examBoardDates))
    }
  }, [examBoardDates])

  // Agrupar materias por mesa de examen
  const subjectsByBoard = subjects.reduce(
    (acc, subject) => {
      const board = subject.examBoard || "1"
      if (!acc[board]) {
        acc[board] = []
      }
      acc[board].push({
        id: subject.id,
        name: subject.name,
        year: subject.year,
        examBoard: board,
        status: userStatus[subject.id],
      })
      return acc
    },
    { "1": [], "2": [], "3": [] } as Record<string, SubjectWithBoard[]>,
  )

  // Filtrar materias con final pendiente
  const pendingFinalsByBoard = {
    "1": subjectsByBoard["1"].filter((subject) => subject.status === "pendingFinal"),
    "2": subjectsByBoard["2"].filter((subject) => subject.status === "pendingFinal"),
    "3": subjectsByBoard["3"].filter((subject) => subject.status === "pendingFinal"),
  }

  // Ordenar fechas de mesas de examen
  const sortedExamBoardDates = [...examBoardDates].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  // Fechas próximas (futuras)
  const upcomingDates = sortedExamBoardDates.filter((date) => date.startDate >= new Date())

  // Fechas pasadas
  const pastDates = sortedExamBoardDates.filter((date) => date.startDate < new Date())

  const handleAddExamBoard = () => {
    if (editingId) {
      // Actualizar mesa existente
      setExamBoardDates(
        examBoardDates.map((date) =>
          date.id === editingId
            ? {
                ...date,
                boardNumber: newExamBoard.boardNumber,
                startDate: newExamBoard.startDate,
                endDate: newExamBoard.endDate,
                description: newExamBoard.description,
              }
            : date,
        ),
      )
      setEditingId(null)
    } else {
      // Agregar nueva mesa
      const newDate: ExamBoardDate = {
        id: Date.now().toString(),
        boardNumber: newExamBoard.boardNumber,
        startDate: newExamBoard.startDate,
        endDate: newExamBoard.endDate,
        description: newExamBoard.description,
      }
      setExamBoardDates([...examBoardDates, newDate])
    }

    // Resetear formulario
    setNewExamBoard({
      boardNumber: "1",
      startDate: new Date(),
      endDate: new Date(),
      description: "",
    })
  }

  const handleEditExamBoard = (date: ExamBoardDate) => {
    setNewExamBoard({
      boardNumber: date.boardNumber,
      startDate: date.startDate,
      endDate: date.endDate,
      description: date.description,
    })
    setEditingId(date.id)
  }

  const handleDeleteExamBoard = (id: string) => {
    setExamBoardDates(examBoardDates.filter((date) => date.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setNewExamBoard({
        boardNumber: "1",
        startDate: new Date(),
        endDate: new Date(),
        description: "",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mesas de Examen Final</CardTitle>
            <CardDescription>
              Gestiona las fechas de las mesas de examen para planificar tus finales pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="upcoming" className="flex-1">
                  Próximas Mesas
                </TabsTrigger>
                <TabsTrigger value="past" className="flex-1">
                  Mesas Pasadas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {upcomingDates.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingDates.map((date) => (
                      <Card key={date.id} className="overflow-hidden">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Mesa {date.boardNumber}</CardTitle>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                            >
                              {format(date.startDate, "dd/MM/yyyy", { locale: es })} -{" "}
                              {format(date.endDate, "dd/MM/yyyy", { locale: es })}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          {date.description && <p className="mb-3 text-sm">{date.description}</p>}
                          <div className="flex flex-wrap gap-2">
                            {pendingFinalsByBoard[date.boardNumber].length > 0 ? (
                              pendingFinalsByBoard[date.boardNumber].map((subject) => (
                                <Badge
                                  key={subject.id}
                                  className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                                >
                                  {subject.name}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No tienes finales pendientes para esta mesa
                              </p>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 py-2 bg-muted/30">
                          <Button variant="ghost" size="sm" onClick={() => handleEditExamBoard(date)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteExamBoard(date.id)}
                          >
                            Eliminar
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No hay mesas programadas</AlertTitle>
                    <AlertDescription>
                      Agrega las fechas de las próximas mesas de examen para planificar tus finales.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="past">
                {pastDates.length > 0 ? (
                  <div className="space-y-4">
                    {pastDates.map((date) => (
                      <Card key={date.id} className="overflow-hidden opacity-70">
                        <CardHeader className="bg-gray-100 dark:bg-gray-800/20 py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Mesa {date.boardNumber}</CardTitle>
                            <Badge variant="outline">
                              {format(date.startDate, "dd/MM/yyyy", { locale: es })} -{" "}
                              {format(date.endDate, "dd/MM/yyyy", { locale: es })}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          {date.description && <p className="mb-3 text-sm">{date.description}</p>}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 py-2 bg-muted/30">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteExamBoard(date.id)}
                          >
                            Eliminar
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No hay mesas pasadas</AlertTitle>
                    <AlertDescription>No se encontraron registros de mesas de examen anteriores.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Mesa de Examen" : "Agregar Mesa de Examen"}</CardTitle>
            <CardDescription>Ingresa los datos de la mesa de examen para planificar tus finales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="boardNumber">Número de Mesa</Label>
                <Select
                  value={newExamBoard.boardNumber}
                  onValueChange={(value) => setNewExamBoard({ ...newExamBoard, boardNumber: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mesa 1</SelectItem>
                    <SelectItem value="2">Mesa 2</SelectItem>
                    <SelectItem value="3">Mesa 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExamBoard.startDate ? (
                          format(newExamBoard.startDate, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newExamBoard.startDate}
                        onSelect={(date) => setNewExamBoard({ ...newExamBoard, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="endDate">Fecha de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExamBoard.endDate ? (
                          format(newExamBoard.endDate, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newExamBoard.endDate}
                        onSelect={(date) => setNewExamBoard({ ...newExamBoard, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  value={newExamBoard.description}
                  onChange={(e) => setNewExamBoard({ ...newExamBoard, description: e.target.value })}
                  placeholder="Ej: Turno de Julio-Agosto"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setNewExamBoard({
                    boardNumber: "1",
                    startDate: new Date(),
                    endDate: new Date(),
                    description: "",
                  })
                }}
              >
                Cancelar
              </Button>
            )}
            <Button onClick={handleAddExamBoard} className={cn(editingId ? "" : "ml-auto")}>
              {editingId ? "Actualizar Mesa" : "Agregar Mesa"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materias por Mesa de Examen</CardTitle>
          <CardDescription>Distribución de materias según la mesa de examen asignada</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="1" className="flex-1">
                Mesa 1
              </TabsTrigger>
              <TabsTrigger value="2" className="flex-1">
                Mesa 2
              </TabsTrigger>
              <TabsTrigger value="3" className="flex-1">
                Mesa 3
              </TabsTrigger>
            </TabsList>

            <TabsContent value="1">
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-800 dark:text-blue-300">Mesa 1</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    {subjectsByBoard["1"].length} materias asignadas a esta mesa
                    {pendingFinalsByBoard["1"].length > 0 &&
                      ` (${pendingFinalsByBoard["1"].length} con final pendiente)`}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectsByBoard["1"].map((subject) => (
                    <div
                      key={subject.id}
                      className={`p-3 rounded-md border ${
                        subject.status === "pendingFinal"
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                          : subject.status === "approved"
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-muted border-muted-foreground/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">{subject.year}° Año</p>
                        </div>
                        {subject.status === "pendingFinal" ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
                            Final Pendiente
                          </Badge>
                        ) : subject.status === "approved" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300">
                            Aprobada
                          </Badge>
                        ) : (
                          <Badge variant="outline">No cursada</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="2">
              <div className="space-y-4">
                <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
                  <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <AlertTitle className="text-purple-800 dark:text-purple-300">Mesa 2</AlertTitle>
                  <AlertDescription className="text-purple-700 dark:text-purple-400">
                    {subjectsByBoard["2"].length} materias asignadas a esta mesa
                    {pendingFinalsByBoard["2"].length > 0 &&
                      ` (${pendingFinalsByBoard["2"].length} con final pendiente)`}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectsByBoard["2"].map((subject) => (
                    <div
                      key={subject.id}
                      className={`p-3 rounded-md border ${
                        subject.status === "pendingFinal"
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                          : subject.status === "approved"
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-muted border-muted-foreground/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">{subject.year}° Año</p>
                        </div>
                        {subject.status === "pendingFinal" ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
                            Final Pendiente
                          </Badge>
                        ) : subject.status === "approved" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300">
                            Aprobada
                          </Badge>
                        ) : (
                          <Badge variant="outline">No cursada</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="3">
              <div className="space-y-4">
                <Alert className="bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800">
                  <Info className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  <AlertTitle className="text-pink-800 dark:text-pink-300">Mesa 3</AlertTitle>
                  <AlertDescription className="text-pink-700 dark:text-pink-400">
                    {subjectsByBoard["3"].length} materias asignadas a esta mesa
                    {pendingFinalsByBoard["3"].length > 0 &&
                      ` (${pendingFinalsByBoard["3"].length} con final pendiente)`}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectsByBoard["3"].map((subject) => (
                    <div
                      key={subject.id}
                      className={`p-3 rounded-md border ${
                        subject.status === "pendingFinal"
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                          : subject.status === "approved"
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-muted border-muted-foreground/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">{subject.year}° Año</p>
                        </div>
                        {subject.status === "pendingFinal" ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
                            Final Pendiente
                          </Badge>
                        ) : subject.status === "approved" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300">
                            Aprobada
                          </Badge>
                        ) : (
                          <Badge variant="outline">No cursada</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
