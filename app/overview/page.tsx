"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Lock,
  Unlock,
  Award,
  TrendingUp,
  Calendar,
  Sparkles,
  Zap,
  Trophy,
  Star,
  Rocket,
  Target,
  Network,
  MessageSquare,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import CareerMap from "@/components/CareerMap"
import StudyAssistantChat from "@/components/StudyAssistantChat"
import ExamBoardManager from "@/components/ExamBoardManager"

export default function Overview() {
  const [subjects, setSubjects] = useState([])
  const [userStatus, setUserStatus] = useState({})
  const [careerData, setCareerData] = useState(null)
  const [simulationStatus, setSimulationStatus] = useState({})
  const [showSimulation, setShowSimulation] = useState(false)
  const [selectedFinalTab, setSelectedFinalTab] = useState("impact")
  const [simulationSemester, setSimulationSemester] = useState(1)
  const [simulationStrategy, setSimulationStrategy] = useState("balanced")
  const [simulationResults, setSimulationResults] = useState(null)
  const [progressAnimation, setProgressAnimation] = useState(0)
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false)
  const [currentMotivationalMessage, setCurrentMotivationalMessage] = useState("")
  const progressAnimationRef = useRef(null)

  useEffect(() => {
    // Intentar cargar desde localStorage
    const storedSubjects = localStorage.getItem("subjects")
    const storedUserStatus = localStorage.getItem("userStatus")

    // Intentar cargar datos de carrera específica (UTN Sistemas por defecto)
    const storedCareerSubjects = localStorage.getItem("subjects-utn-sistemas")
    const storedCareerUserStatus = localStorage.getItem("userStatus-utn-sistemas")

    if (storedCareerSubjects && storedCareerUserStatus) {
      const parsedSubjects = JSON.parse(storedCareerSubjects)
      const parsedUserStatus = JSON.parse(storedCareerUserStatus)

      setCareerData({
        name: "Ingeniería en Sistemas de Información - UTN",
        subjects: parsedSubjects,
        userStatus: parsedUserStatus,
      })

      setSubjects(parsedSubjects)
      setUserStatus(parsedUserStatus)
      setSimulationStatus(parsedUserStatus)
    } else if (storedSubjects) {
      const parsedSubjects = JSON.parse(storedSubjects)
      setSubjects(parsedSubjects)

      if (storedUserStatus) {
        const parsedUserStatus = JSON.parse(storedUserStatus)
        setUserStatus(parsedUserStatus)
        setSimulationStatus(parsedUserStatus)
      }
    }
  }, [])

  // Calcular estadísticas
  const totalSubjects = subjects.length
  const approvedSubjects = subjects.filter((subject) => userStatus[subject.id] === "approved").length
  const pendingFinals = subjects.filter((subject) => userStatus[subject.id] === "pendingFinal").length
  const inProgressSubjects = subjects.filter((subject) => userStatus[subject.id] === "inProgress").length
  const notStartedSubjects = subjects.filter(
    (subject) => !userStatus[subject.id] || userStatus[subject.id] === "notStarted",
  ).length

  // Calcular porcentajes
  const approvedPercentage = totalSubjects > 0 ? Math.round((approvedSubjects / totalSubjects) * 100) : 0
  const pendingFinalsPercentage = totalSubjects > 0 ? Math.round((pendingFinals / totalSubjects) * 100) : 0
  const inProgressPercentage = totalSubjects > 0 ? Math.round((inProgressSubjects / totalSubjects) * 100) : 0
  const notStartedPercentage = totalSubjects > 0 ? Math.round((notStartedSubjects / totalSubjects) * 100) : 0

  // Animación de progreso
  useEffect(() => {
    // Iniciar la animación desde 0 hasta el porcentaje actual
    const startValue = 0
    const endValue = approvedPercentage
    const duration = 2000 // 2 segundos
    const stepTime = 20 // 20ms por paso
    const totalSteps = duration / stepTime
    const stepValue = (endValue - startValue) / totalSteps

    if (progressAnimationRef.current) {
      clearInterval(progressAnimationRef.current)
    }

    progressAnimationRef.current = setInterval(() => {
      setProgressAnimation((prev) => {
        const newValue = prev + stepValue
        if (newValue >= endValue) {
          clearInterval(progressAnimationRef.current)
          return endValue
        }
        return newValue
      })
    }, stepTime)

    return () => {
      if (progressAnimationRef.current) {
        clearInterval(progressAnimationRef.current)
      }
    }
  }, [approvedPercentage])

  // Mostrar mensajes motivacionales basados en el progreso
  useEffect(() => {
    const messages = [
      {
        threshold: 0,
        message: "¡El comienzo de un gran viaje! Cada paso cuenta.",
        icon: <Rocket className="h-5 w-5 text-blue-500" />,
      },
      {
        threshold: 10,
        message: "¡Vas por buen camino! Mantén ese ritmo.",
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      },
      {
        threshold: 25,
        message: "¡25% completado! Ya has superado el primer cuarto de tu carrera.",
        icon: <Star className="h-5 w-5 text-yellow-500" />,
      },
      {
        threshold: 50,
        message: "¡Mitad del camino recorrido! La meta está cada vez más cerca.",
        icon: <Trophy className="h-5 w-5 text-amber-500" />,
      },
      {
        threshold: 75,
        message: "¡75% completado! La recta final está a la vista.",
        icon: <Zap className="h-5 w-5 text-purple-500" />,
      },
      {
        threshold: 90,
        message: "¡Casi allí! Solo un pequeño esfuerzo más.",
        icon: <Target className="h-5 w-5 text-red-500" />,
      },
      {
        threshold: 100,
        message: "¡Felicitaciones! Has completado tu carrera.",
        icon: <Sparkles className="h-5 w-5 text-green-500" />,
      },
    ]

    // Encontrar el mensaje apropiado para el progreso actual
    const currentMessage = [...messages].reverse().find((msg) => progressAnimation >= msg.threshold)

    if (currentMessage) {
      setCurrentMotivationalMessage(
        <div className="flex items-center gap-2">
          {currentMessage.icon}
          <span>{currentMessage.message}</span>
        </div>,
      )
      setShowMotivationalMessage(true)

      // Ocultar el mensaje después de 5 segundos
      const timer = setTimeout(() => {
        setShowMotivationalMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [progressAnimation])

  // Calcular materias por año
  const subjectsByYear = {}
  subjects.forEach((subject) => {
    const year = subject.year || "1"
    if (!subjectsByYear[year]) {
      subjectsByYear[year] = {
        total: 0,
        approved: 0,
        pendingFinal: 0,
        inProgress: 0,
        notStarted: 0,
      }
    }

    subjectsByYear[year].total++

    const status = userStatus[subject.id] || "notStarted"
    subjectsByYear[year][status]++
  })

  // Análisis de correlatividades
  const getPrerequisiteChain = (subjectId, visited = new Set()) => {
    if (visited.has(subjectId)) return []
    visited.add(subjectId)

    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject || !subject.prerequisites || subject.prerequisites.length === 0) return []

    let chain = [...subject.prerequisites]
    subject.prerequisites.forEach((prereqId) => {
      chain = [...chain, ...getPrerequisiteChain(prereqId, visited)]
    })

    return chain
  }

  // Materias bloqueadas por correlatividades
  const blockedSubjects = subjects.filter((subject) => {
    if (!subject.prerequisites || subject.prerequisites.length === 0) return false

    // Una materia está bloqueada si al menos uno de sus prerrequisitos no está aprobado o con final pendiente
    return subject.prerequisites.some(
      (prereqId) =>
        !userStatus[prereqId] || (userStatus[prereqId] !== "approved" && userStatus[prereqId] !== "pendingFinal"),
    )
  })

  // Materias habilitadas para cursar (prerrequisitos cumplidos pero aún no cursadas)
  const availableSubjects = subjects.filter((subject) => {
    // No debe estar ya aprobada, cursando o con final pendiente
    if (
      userStatus[subject.id] === "approved" ||
      userStatus[subject.id] === "inProgress" ||
      userStatus[subject.id] === "pendingFinal"
    )
      return false

    // Si no tiene prerrequisitos, está disponible
    if (!subject.prerequisites || subject.prerequisites.length === 0) return true

    // Todos los prerrequisitos deben estar aprobados o con final pendiente
    return subject.prerequisites.every(
      (prereqId) => userStatus[prereqId] === "approved" || userStatus[prereqId] === "pendingFinal",
    )
  })

  // Análisis de finales pendientes
  const pendingFinalsAnalysis = subjects
    .filter((subject) => userStatus[subject.id] === "pendingFinal")
    .map((subject) => {
      // Verificar si este final está bloqueando a otras materias para cursar
      const blocksForCursado = subjects.filter((s) => {
        if (userStatus[s.id] === "approved" || userStatus[s.id] === "inProgress" || userStatus[s.id] === "pendingFinal")
          return false

        if (!s.prerequisites || s.prerequisites.length === 0) return false

        // Esta materia está en los prerrequisitos y no está aprobada
        return s.prerequisites.includes(subject.id) && userStatus[subject.id] !== "approved"
      })

      // Verificar si este final está bloqueando a otras materias para rendir final
      const blocksForFinal = subjects.filter((s) => {
        if (userStatus[s.id] !== "pendingFinal") return false

        if (!s.finalPrerequisites || s.finalPrerequisites.length === 0) return false

        // Esta materia está en los prerrequisitos de final y no está aprobada
        return s.finalPrerequisites.includes(subject.id) && userStatus[subject.id] !== "approved"
      })

      // Verificar si este final tiene sus propios prerrequisitos pendientes
      const blockedByFinals = []
      if (subject.finalPrerequisites && subject.finalPrerequisites.length > 0) {
        subject.finalPrerequisites.forEach((prereqId) => {
          if (userStatus[prereqId] !== "approved") {
            const prereq = subjects.find((s) => s.id === prereqId)
            if (prereq) {
              blockedByFinals.push(prereq)
            }
          }
        })
      }

      return {
        id: subject.id,
        name: subject.name,
        year: subject.year,
        blocksForCursado,
        blocksForFinal,
        blockedByFinals,
        totalBlocked: blocksForCursado.length + blocksForFinal.length,
        canBeRendered: blockedByFinals.length === 0,
      }
    })
    .sort((a, b) => b.totalBlocked - a.totalBlocked)

  // Finales que habilitan más materias
  const finalsImpact = pendingFinalsAnalysis.filter((item) => item.totalBlocked > 0)

  // Finales que se pueden rendir inmediatamente
  const availableToRender = pendingFinalsAnalysis.filter((item) => item.canBeRendered)

  // Finales bloqueados por otros finales
  const blockedFinals = pendingFinalsAnalysis.filter((item) => item.blockedByFinals.length > 0)

  // Datos para gráficos
  const statusData = [
    { name: "Aprobadas", value: approvedSubjects, color: "#10b981" },
    { name: "Final Pendiente", value: pendingFinals, color: "#f59e0b" },
    { name: "Cursando", value: inProgressSubjects, color: "#3b82f6" },
    { name: "Por Cursar", value: notStartedSubjects, color: "#6b7280" },
  ]

  const yearProgressData = Object.keys(subjectsByYear)
    .sort()
    .map((year) => ({
      name: `${year}° Año`,
      aprobadas: subjectsByYear[year].approved,
      pendientes: subjectsByYear[year].pendingFinal,
      cursando: subjectsByYear[year].inProgress,
      porCursar: subjectsByYear[year].notStarted,
      total: subjectsByYear[year].total,
    }))

  // Simulación de planificación
  const handleToggleFinal = (subjectId) => {
    setSimulationStatus((prev) => {
      const newStatus = { ...prev }
      newStatus[subjectId] = newStatus[subjectId] === "approved" ? "pendingFinal" : "approved"
      return newStatus
    })
  }

  const handleToggleSubjectStatus = (subjectId, status) => {
    setSimulationStatus((prev) => ({
      ...prev,
      [subjectId]: status,
    }))
  }

  // Materias que se habilitarían en la simulación
  const simulatedAvailableSubjects = useMemo(() => {
    // Calcular materias que estarían disponibles con el estado simulado
    const wouldBeAvailable = subjects.filter((subject) => {
      // No debe estar ya aprobada o cursando en la simulación
      if (simulationStatus[subject.id] === "approved" || simulationStatus[subject.id] === "inProgress") return false

      // Si no tiene prerrequisitos, está disponible
      if (!subject.prerequisites || subject.prerequisites.length === 0) return true

      // Todos los prerrequisitos deben estar aprobados o con final pendiente en la simulación
      return subject.prerequisites.every(
        (prereqId) => simulationStatus[prereqId] === "approved" || simulationStatus[prereqId] === "pendingFinal",
      )
    })

    // Filtrar solo las que no estaban disponibles antes
    return wouldBeAvailable.filter(
      (subject) =>
        // No estaba disponible con el estado real
        !availableSubjects.some((s) => s.id === subject.id) &&
        // Y no es una que ya tiene final pendiente en el estado real
        userStatus[subject.id] !== "pendingFinal" &&
        // Y no es una que ya está aprobada en el estado real
        userStatus[subject.id] !== "approved" &&
        // Y no es una que ya está cursando en el estado real
        userStatus[subject.id] !== "inProgress",
    )
  }, [subjects, simulationStatus, availableSubjects, userStatus])

  // Función para ejecutar la simulación avanzada
  const runAdvancedSimulation = () => {
    // Clonar el estado actual para la simulación
    let simulatedState = { ...simulationStatus }
    const simulationHistory = []
    const maxSemesters = simulationSemester || 4 // Número de semestres a simular

    // Estrategias de simulación
    const strategies = {
      // Prioriza aprobar finales pendientes
      finals: (state, availableFinalsToRender, availableSubjectsToCourse) => {
        // Primero aprobar todos los finales disponibles
        availableFinalsToRender.forEach((final) => {
          state[final.id] = "approved"
        })

        // Luego cursar materias disponibles (máximo 4 por semestre)
        availableSubjectsToCourse.slice(0, 4).forEach((subject) => {
          state[subject.id] = "inProgress"
        })

        return state
      },

      // Prioriza cursar nuevas materias
      courses: (state, availableFinalsToRender, availableSubjectsToCourse) => {
        // Primero cursar materias disponibles (máximo 5 por semestre)
        availableSubjectsToCourse.slice(0, 5).forEach((subject) => {
          state[subject.id] = "inProgress"
        })

        // Luego aprobar algunos finales disponibles (máximo 2 por semestre)
        availableFinalsToRender.slice(0, 2).forEach((final) => {
          state[final.id] = "approved"
        })

        return state
      },

      // Equilibrio entre cursar y aprobar finales
      balanced: (state, availableFinalsToRender, availableSubjectsToCourse) => {
        // Aprobar finales prioritarios (máximo 3)
        availableFinalsToRender.slice(0, 3).forEach((final) => {
          state[final.id] = "approved"
        })

        // Cursar materias disponibles (máximo 3)
        availableSubjectsToCourse.slice(0, 3).forEach((subject) => {
          state[subject.id] = "inProgress"
        })

        return state
      },
    }

    // Ejecutar la simulación semestre por semestre
    for (let semester = 1; semester <= maxSemesters; semester++) {
      // Calcular materias disponibles para cursar en este semestre
      const availableSubjectsToCourse = subjects.filter((subject) => {
        // No debe estar ya aprobada, cursando o con final pendiente
        if (
          simulatedState[subject.id] === "approved" ||
          simulatedState[subject.id] === "inProgress" ||
          simulatedState[subject.id] === "pendingFinal"
        )
          return false

        // Si no tiene prerrequisitos, está disponible
        if (!subject.prerequisites || subject.prerequisites.length === 0) return true

        // Todos los prerrequisitos deben estar aprobados o con final pendiente
        return subject.prerequisites.every(
          (prereqId) => simulatedState[prereqId] === "approved" || simulatedState[prereqId] === "pendingFinal",
        )
      })

      // Calcular finales disponibles para rendir
      const availableFinalsToRender = subjects
        .filter((subject) => simulatedState[subject.id] === "pendingFinal")
        .filter((subject) => {
          // Verificar si este final tiene sus propios prerrequisitos pendientes
          if (!subject.finalPrerequisites || subject.finalPrerequisites.length === 0) return true

          // Todos los prerrequisitos de final deben estar aprobados
          return subject.finalPrerequisites.every((prereqId) => simulatedState[prereqId] === "approved")
        })
        .map((subject) => ({
          id: subject.id,
          name: subject.name,
          year: subject.year,
          // Calcular cuántas materias desbloquea este final
          impact: subjects.filter((s) => {
            if (
              simulatedState[s.id] === "approved" ||
              simulatedState[s.id] === "inProgress" ||
              simulatedState[s.id] === "pendingFinal"
            )
              return false

            if (!s.prerequisites || !s.prerequisites.includes(subject.id)) return false

            return true
          }).length,
        }))
        .sort((a, b) => b.impact - a.impact) // Ordenar por impacto

      // Aplicar la estrategia seleccionada
      simulatedState = strategies[simulationStrategy](
        { ...simulatedState },
        availableFinalsToRender,
        availableSubjectsToCourse,
      )

      // Al final del semestre, las materias en curso pasan a final pendiente
      Object.keys(simulatedState).forEach((subjectId) => {
        if (simulatedState[subjectId] === "inProgress") {
          simulatedState[subjectId] = "pendingFinal"
        }
      })

      // Guardar el estado de este semestre
      const semesterStats = {
        semester,
        approved: subjects.filter((s) => simulatedState[s.id] === "approved").length,
        pendingFinal: subjects.filter((s) => simulatedState[s.id] === "pendingFinal").length,
        available: availableSubjectsToCourse.length,
        progress: Math.round(
          (subjects.filter((s) => simulatedState[s.id] === "approved").length / totalSubjects) * 100,
        ),
      }

      simulationHistory.push(semesterStats)
    }

    // Calcular estadísticas finales
    const finalStats = {
      initialApproved: approvedSubjects,
      finalApproved: subjects.filter((s) => simulatedState[s.id] === "approved").length,
      initialPendingFinals: pendingFinals,
      finalPendingFinals: subjects.filter((s) => simulatedState[s.id] === "pendingFinal").length,
      initialProgress: approvedPercentage,
      finalProgress: Math.round(
        (subjects.filter((s) => simulatedState[s.id] === "approved").length / totalSubjects) * 100,
      ),
      progressGain:
        Math.round((subjects.filter((s) => simulatedState[s.id] === "approved").length / totalSubjects) * 100) -
        approvedPercentage,
      history: simulationHistory,
      estimatedGraduation: calculateEstimatedGraduation(simulatedState),
    }

    setSimulationResults(finalStats)
  }

  // Función para calcular tiempo estimado de graduación
  const calculateEstimatedGraduation = (state) => {
    const approvedCount = subjects.filter((s) => state[s.id] === "approved").length
    const pendingCount = totalSubjects - approvedCount

    // Calcular la velocidad de avance (materias por semestre)
    const progressRate = simulationResults
      ? (simulationResults.finalApproved - simulationResults.initialApproved) / simulationSemester
      : 2 // valor por defecto

    if (progressRate <= 0) return "Indeterminado"

    // Calcular semestres restantes
    const remainingSemesters = Math.ceil(pendingCount / progressRate)

    // Convertir a años y semestres
    const years = Math.floor(remainingSemesters / 2)
    const extraSemester = remainingSemesters % 2

    if (years === 0 && extraSemester === 0) return "¡Ya completaste la carrera!"
    if (years === 0) return `${extraSemester} semestre`
    if (years === 0) return `${years} año${years > 1 ? "s" : ""}`
    return `${years} año${years > 1 ? "s" : ""} y ${extraSemester} semestre`
  }

  // Cálculo de carga académica histórica
  const academicLoad = {}
  subjects.forEach((subject) => {
    if (userStatus[subject.id] === "approved" || userStatus[subject.id] === "pendingFinal") {
      const year = subject.year || "1"
      const period =
        subject.duration === "anual"
          ? "anual"
          : subject.semester === "primero"
            ? "1er cuatrimestre"
            : "2do cuatrimestre"

      const key = `${year}-${period}`
      if (!academicLoad[key]) {
        academicLoad[key] = 0
      }
      academicLoad[key]++
    }
  })

  const academicLoadData = Object.keys(academicLoad)
    .sort()
    .map((key) => {
      const [year, period] = key.split("-")
      return {
        name: `${year}° - ${period}`,
        materias: academicLoad[key],
      }
    })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Overview de la Carrera</h1>

      {careerData && (
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{careerData.name}</CardTitle>
              <div className="flex items-center">
                <img src="/images/utn-logo.png" alt="UTN Logo" className="h-10 w-10 mr-2" />
              </div>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{totalSubjects}</span>
                <span className="text-sm text-muted-foreground">Materias Totales</span>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{approvedSubjects}</span>
                <span className="text-sm text-muted-foreground">Materias Aprobadas</span>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{pendingFinals}</span>
                <span className="text-sm text-muted-foreground">Finales Pendientes</span>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{availableSubjects.length}</span>
                <span className="text-sm text-muted-foreground">Materias Disponibles</span>
              </div>
              <Unlock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress">
        <TabsList className="mb-4">
          <TabsTrigger value="progress">Progreso General</TabsTrigger>
          <TabsTrigger value="finals">Análisis de Finales</TabsTrigger>
          <TabsTrigger value="correlatives">Análisis de Correlatividades</TabsTrigger>
          <TabsTrigger value="planning">Planificación</TabsTrigger>
          <TabsTrigger value="examboards">Mesas de Examen</TabsTrigger>
          <TabsTrigger value="careermap">Mapa de Carrera</TabsTrigger>
          <TabsTrigger value="assistant">Asistente de Estudio</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas Detalladas</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progreso General</CardTitle>
                <CardDescription>Distribución de materias por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} materias`, "Cantidad"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Progreso total de la carrera</span>
                      <span className="font-semibold">{Math.round(progressAnimation)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={progressAnimation} className="h-4" />

                      {/* Marcadores de hitos */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {[25, 50, 75, 100].map((milestone) => (
                          <div
                            key={milestone}
                            className="absolute top-0 h-full flex items-center"
                            style={{ left: `${milestone}%` }}
                          >
                            <div className="h-6 w-1 bg-white rounded-full shadow-md -ml-0.5"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mensaje motivacional */}
                    {showMotivationalMessage && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-blue-800 animate-pulse">
                        {currentMotivationalMessage}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progreso por Año</CardTitle>
                <CardDescription>Distribución de materias por año de la carrera</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={yearProgressData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="aprobadas" stackId="a" name="Aprobadas" fill="#10b981" />
                      <Bar dataKey="pendientes" stackId="a" name="Final Pendiente" fill="#f59e0b" />
                      <Bar dataKey="cursando" stackId="a" name="Cursando" fill="#3b82f6" />
                      <Bar dataKey="porCursar" stackId="a" name="Por Cursar" fill="#6b7280" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Finales Pendientes</CardTitle>
                <CardDescription>Impacto de tus finales pendientes en el avance de la carrera</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={selectedFinalTab} onValueChange={setSelectedFinalTab} className="mb-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="impact" className="flex-1">
                      Impacto
                    </TabsTrigger>
                    <TabsTrigger value="available" className="flex-1">
                      Disponibles
                    </TabsTrigger>
                    <TabsTrigger value="blocked" className="flex-1">
                      Bloqueados
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="impact">
                    {finalsImpact.length > 0 ? (
                      <div className="space-y-4">
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={finalsImpact.slice(0, 5)}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" width={150} />
                              <Tooltip
                                formatter={(value, name, props) => {
                                  if (name === "totalBlocked") return [`${value} materias`, "Desbloquea"]
                                  return [value, name]
                                }}
                              />
                              <Bar dataKey="totalBlocked" name="Materias que desbloquea" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          {finalsImpact.map((final) => (
                            <AccordionItem key={final.id} value={final.id}>
                              <AccordionTrigger>
                                <div className="flex items-center justify-between w-full pr-4">
                                  <span>{final.name}</span>
                                  <Badge>{final.totalBlocked} materias</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 p-2">
                                  {final.blocksForCursado.length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-1">Materias que podrías cursar:</h4>
                                      <ul className="list-disc list-inside text-sm">
                                        {final.blocksForCursado.map((subject) => (
                                          <li key={`cursado-${subject.id}`}>{subject.name}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {final.blocksForFinal.length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-1">Finales que podrías rendir:</h4>
                                      <ul className="list-disc list-inside text-sm">
                                        {final.blocksForFinal.map((subject) => (
                                          <li key={`final-${subject.id}`}>{subject.name}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {final.blockedByFinals.length > 0 && (
                                    <div className="bg-amber-50 p-2 rounded-md">
                                      <h4 className="font-medium text-amber-800 mb-1">Requiere aprobar primero:</h4>
                                      <ul className="list-disc list-inside text-sm text-amber-700">
                                        {final.blockedByFinals.map((subject) => (
                                          <li key={`blocked-${subject.id}`}>{subject.name}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-60 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay finales pendientes que desbloqueen materias.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="available">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-xl font-bold">{availableToRender.length}</span>
                        <span className="text-muted-foreground">finales que puedes rendir ahora</span>
                      </div>

                      {availableToRender.length > 0 ? (
                        <div className="border rounded-md p-3">
                          <ul className="space-y-2">
                            {availableToRender.map((final) => (
                              <li
                                key={final.id}
                                className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                              >
                                <div>
                                  <div className="font-medium">{final.name}</div>
                                  <div className="text-sm text-muted-foreground">{final.year}° Año</div>
                                </div>
                                {final.totalBlocked > 0 && (
                                  <Badge variant="outline">{final.totalBlocked} materias</Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No hay finales disponibles para rendir en este momento.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="blocked">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-5 w-5 text-red-500" />
                        <span className="text-xl font-bold">{blockedFinals.length}</span>
                        <span className="text-muted-foreground">finales bloqueados por otros finales</span>
                      </div>

                      {blockedFinals.length > 0 ? (
                        <div className="border rounded-md p-3">
                          <ul className="space-y-3">
                            {blockedFinals.map((final) => (
                              <li key={final.id} className="border-b pb-3 last:border-0 last:pb-0">
                                <div className="font-medium">{final.name}</div>
                                <div className="text-sm text-muted-foreground mb-1">{final.year}° Año</div>
                                <div className="bg-amber-50 p-2 rounded-md">
                                  <h4 className="text-sm font-medium text-amber-800 mb-1">Requiere aprobar primero:</h4>
                                  <ul className="list-disc list-inside text-xs text-amber-700">
                                    {final.blockedByFinals.map((subject) => (
                                      <li key={`blocked-${subject.id}`}>{subject.name}</li>
                                    ))}
                                  </ul>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No hay finales bloqueados por otros finales.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estrategia de Finales</CardTitle>
                <CardDescription>Recomendaciones para optimizar tu avance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pendingFinals > 0 ? (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <h3 className="text-lg font-medium text-blue-800 mb-2">Resumen de Finales</h3>
                        <ul className="space-y-2 text-blue-700">
                          <li className="flex justify-between">
                            <span>Finales pendientes:</span>
                            <span className="font-semibold">{pendingFinals}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Finales que puedes rendir ahora:</span>
                            <span className="font-semibold">{availableToRender.length}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Finales bloqueados:</span>
                            <span className="font-semibold">{blockedFinals.length}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Materias bloqueadas por finales:</span>
                            <span className="font-semibold">
                              {
                                subjects.filter(
                                  (s) =>
                                    userStatus[s.id] !== "approved" &&
                                    userStatus[s.id] !== "inProgress" &&
                                    userStatus[s.id] !== "pendingFinal" &&
                                    s.prerequisites &&
                                    s.prerequisites.some((prereqId) => userStatus[prereqId] === "pendingFinal"),
                                ).length
                              }
                            </span>
                          </li>
                        </ul>
                      </div>

                      {availableToRender.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Próximos finales recomendados</h3>
                          <ol className="space-y-2 list-decimal list-inside">
                            {availableToRender
                              .sort((a, b) => b.totalBlocked - a.totalBlocked)
                              .slice(0, 3)
                              .map((final, index) => (
                                <li key={final.id} className="pl-2">
                                  <span className="font-medium">{final.name}</span>
                                  {final.totalBlocked > 0 && (
                                    <span className="text-sm text-muted-foreground ml-2">
                                      (desbloquea {final.totalBlocked} materias)
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ol>
                        </div>
                      )}

                      {blockedFinals.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Cadenas de finales</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Estas son las secuencias de finales que debes aprobar para desbloquear más materias:
                          </p>

                          {/* Mostrar algunas cadenas de finales */}
                          <div className="space-y-3">
                            {blockedFinals.slice(0, 2).map((final) => {
                              const chain = [
                                ...final.blockedByFinals.map((s) => s.name),
                                "→",
                                final.name,
                                "→",
                                ...final.blocksForCursado.slice(0, 2).map((s) => s.name),
                              ]

                              return (
                                <div key={final.id} className="p-2 bg-gray-50 rounded-md text-sm">
                                  {chain.join(" ")}
                                  {final.blocksForCursado.length > 2 && " y más..."}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-lg font-medium">¡No tienes finales pendientes!</p>
                      <p className="text-muted-foreground">Estás al día con todos tus finales. ¡Excelente trabajo!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlatives">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Correlatividades</CardTitle>
                <CardDescription>Análisis de materias bloqueadas y disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Materias Bloqueadas</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-red-500" />
                      <span className="text-xl font-bold">{blockedSubjects.length}</span>
                      <span className="text-muted-foreground">materias requieren prerrequisitos</span>
                    </div>
                    {blockedSubjects.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                        <ul className="space-y-1">
                          {blockedSubjects.slice(0, 5).map((subject) => (
                            <li key={subject.id} className="text-sm">
                              {subject.name} - {subject.year}° año
                            </li>
                          ))}
                          {blockedSubjects.length > 5 && (
                            <li className="text-sm text-muted-foreground">Y {blockedSubjects.length - 5} más...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Materias Disponibles</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Unlock className="h-5 w-5 text-green-500" />
                      <span className="text-xl font-bold">{availableSubjects.length}</span>
                      <span className="text-muted-foreground">materias listas para cursar</span>
                    </div>
                    {availableSubjects.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                        <ul className="space-y-1">
                          {availableSubjects.map((subject) => (
                            <li key={subject.id} className="text-sm">
                              {subject.name} - {subject.year}° año
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mapa de Correlatividades</CardTitle>
                <CardDescription>Visualización de dependencias entre materias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="font-medium text-blue-800 mb-1">Estadísticas de correlatividades</h3>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li className="flex justify-between">
                        <span>Materias sin correlativas:</span>
                        <span className="font-semibold">
                          {subjects.filter((s) => !s.prerequisites || s.prerequisites.length === 0).length}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Materias con correlativas para cursar:</span>
                        <span className="font-semibold">
                          {subjects.filter((s) => s.prerequisites && s.prerequisites.length > 0).length}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Materias con correlativas para final:</span>
                        <span className="font-semibold">
                          {subjects.filter((s) => s.finalPrerequisites && s.finalPrerequisites.length > 0).length}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Materias con más dependencias</h3>
                    <div className="border rounded-md p-2">
                      <ul className="space-y-2">
                        {subjects
                          .map((subject) => {
                            // Contar cuántas materias dependen de esta
                            const dependentCount = subjects.filter(
                              (s) =>
                                (s.prerequisites && s.prerequisites.includes(subject.id)) ||
                                (s.finalPrerequisites && s.finalPrerequisites.includes(subject.id)),
                            ).length
                            return { ...subject, dependentCount }
                          })
                          .filter((s) => s.dependentCount > 0)
                          .sort((a, b) => b.dependentCount - a.dependentCount)
                          .slice(0, 5)
                          .map((subject) => (
                            <li key={subject.id} className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{subject.name}</div>
                                <div className="text-sm text-muted-foreground">{subject.year}° Año</div>
                              </div>
                              <Badge variant="outline">{subject.dependentCount} dependencias</Badge>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulación Avanzada de Planificación</CardTitle>
                <CardDescription>Simula tu progreso en los próximos semestres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="simulationSemester" className="mb-2 block">
                        Cantidad de semestres a simular
                      </Label>
                      <Select
                        value={simulationSemester.toString()}
                        onValueChange={(value) => setSimulationSemester(Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona cantidad de semestres" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 semestre</SelectItem>
                          <SelectItem value="2">2 semestres (1 año)</SelectItem>
                          <SelectItem value="4">4 semestres (2 años)</SelectItem>
                          <SelectItem value="6">6 semestres (3 años)</SelectItem>
                          <SelectItem value="8">8 semestres (4 años)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block">Estrategia de avance</Label>
                      <RadioGroup
                        value={simulationStrategy}
                        onValueChange={setSimulationStrategy}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="balanced" id="balanced" />
                          <Label htmlFor="balanced">Equilibrada</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="finals" id="finals" />
                          <Label htmlFor="finals">Priorizar finales</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="courses" id="courses" />
                          <Label htmlFor="courses">Priorizar cursadas</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-end">
                      <Button onClick={runAdvancedSimulation} className="w-full">
                        Ejecutar Simulación
                      </Button>
                    </div>
                  </div>

                  {simulationResults && (
                    <div className="space-y-6 mt-6">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <h3 className="text-lg font-medium text-blue-800 mb-3">Resultados de la Simulación</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-blue-700">Estado Inicial</h4>
                            <ul className="space-y-1 text-sm text-blue-600">
                              <li className="flex justify-between">
                                <span>Materias aprobadas:</span>
                                <span className="font-semibold">{simulationResults.initialApproved}</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Finales pendientes:</span>
                                <span className="font-semibold">{simulationResults.initialPendingFinals}</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Progreso:</span>
                                <span className="font-semibold">{simulationResults.initialProgress}%</span>
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-blue-700">
                              Estado Final (en {simulationSemester} semestres)
                            </h4>
                            <ul className="space-y-1 text-sm text-blue-600">
                              <li className="flex justify-between">
                                <span>Materias aprobadas:</span>
                                <span className="font-semibold">{simulationResults.finalApproved}</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Finales pendientes:</span>
                                <span className="font-semibold">{simulationResults.finalPendingFinals}</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Progreso:</span>
                                <span className="font-semibold">{simulationResults.finalProgress}%</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-blue-700">Ganancia de progreso:</span>
                            <span className="font-semibold text-blue-700">+{simulationResults.progressGain}%</span>
                          </div>
                          <Progress
                            value={simulationResults.progressGain}
                            max={100 - simulationResults.initialProgress}
                            className="h-2 bg-blue-100"
                          />
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-blue-700">
                            <span>Tiempo estimado para graduación:</span>
                            <span className="font-semibold">{simulationResults.estimatedGraduation}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Progreso por semestre</h3>
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[
                                { semester: 0, progress: simulationResults.initialProgress },
                                ...simulationResults.history,
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="semester"
                                label={{ value: "Semestre", position: "insideBottomRight", offset: -10 }}
                              />
                              <YAxis
                                label={{ value: "Progreso (%)", angle: -90, position: "insideLeft" }}
                                domain={[0, 100]}
                              />
                              <Tooltip formatter={(value) => [`${value}%`, "Progreso"]} />
                              <Line
                                type="monotone"
                                dataKey="progress"
                                stroke="#3b82f6"
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Recomendaciones</h3>
                        <div className="space-y-3">
                          {simulationResults.progressGain > 15 && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <h4 className="font-medium text-green-800 flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Excelente progreso
                              </h4>
                              <p className="text-sm text-green-700 mt-1">
                                Con esta estrategia lograrás un avance significativo del{" "}
                                {simulationResults.progressGain}% en los próximos {simulationSemester} semestres.
                              </p>
                            </div>
                          )}

                          {simulationResults.progressGain < 10 && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                              <h4 className="font-medium text-amber-800 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Progreso lento
                              </h4>
                              <p className="text-sm text-amber-700 mt-1">
                                Con esta estrategia tu avance será de solo {simulationResults.progressGain}% en{" "}
                                {simulationSemester} semestres. Considera priorizar finales que desbloqueen más
                                materias.
                              </p>
                            </div>
                          )}

                          {simulationStrategy === "balanced" &&
                            simulationResults.progressGain >= 10 &&
                            simulationResults.progressGain <= 15 && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <h4 className="font-medium text-blue-800 flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Buen progreso
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  Con esta estrategia equilibrada lograrás un avance constante. Continúa balanceando
                                  finales y cursadas para mantener un ritmo sostenible.
                                </p>
                              </div>
                            )}

                          {simulationResults.estimatedGraduation.includes("año") &&
                            !simulationResults.estimatedGraduation.includes("completaste") && (
                              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                                <h4 className="font-medium text-purple-800 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Planificación a largo plazo
                                </h4>
                                <p className="text-sm text-purple-700 mt-1">
                                  Con tu ritmo actual, te graduarías en aproximadamente{" "}
                                  {simulationResults.estimatedGraduation}. Considera aumentar tu carga académica si es
                                  posible.
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulación Manual</CardTitle>
                <CardDescription>Simula aprobar finales específicos para ver qué materias se habilitan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowSimulation(!showSimulation)}>
                      {showSimulation ? "Ocultar Simulación" : "Iniciar Simulación"}
                    </Button>

                    {showSimulation && (
                      <Button variant="outline" onClick={() => setSimulationStatus({ ...userStatus })}>
                        Reiniciar
                      </Button>
                    )}
                  </div>

                  {showSimulation && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Selecciona finales a aprobar</h3>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                          {subjects
                            .filter((subject) => userStatus[subject.id] === "pendingFinal")
                            .map((subject) => (
                              <div key={subject.id} className="flex items-center space-x-2 py-1">
                                <Checkbox
                                  id={`sim-${subject.id}`}
                                  checked={simulationStatus[subject.id] === "approved"}
                                  onCheckedChange={() => handleToggleFinal(subject.id)}
                                />
                                <Label htmlFor={`sim-${subject.id}`}>{subject.name}</Label>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Materias que se habilitarían</h3>
                        {simulatedAvailableSubjects.length > 0 ? (
                          <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                            <ul className="space-y-1">
                              {simulatedAvailableSubjects.map((subject) => (
                                <li key={subject.id} className="text-sm flex items-center">
                                  <Unlock className="h-4 w-4 text-green-500 mr-2" />
                                  {subject.name} - {subject.year}° año
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            No se habilitarían nuevas materias con los finales seleccionados.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examboards">
          <ExamBoardManager subjects={subjects} userStatus={userStatus} />
        </TabsContent>

        <TabsContent value="careermap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-500" />
                Mapa Interactivo de la Carrera
              </CardTitle>
              <CardDescription>
                Visualización de la red de materias y sus correlatividades. Arrastra los nodos para reorganizar, haz
                zoom con la rueda del mouse y haz clic en cada materia para ver sus detalles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CareerMap subjects={subjects} userStatus={userStatus} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Asistente de Estudio
              </CardTitle>
              <CardDescription>
                Consulta con nuestro asistente inteligente sobre tu plan de estudios, correlatividades, estrategias de
                cursado y más.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudyAssistantChat
                subjects={subjects}
                userStatus={userStatus}
                careerData={careerData}
                stats={{
                  totalSubjects,
                  approvedSubjects,
                  pendingFinals,
                  inProgressSubjects,
                  notStartedSubjects,
                  approvedPercentage,
                  availableSubjects: availableSubjects.length,
                  blockedSubjects: blockedSubjects.length,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Electivas vs Obligatorias */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Obligatorias</span>
                      <span>{subjects.filter((s) => !s.isElective).length} materias</span>
                    </div>
                    <Progress
                      value={(subjects.filter((s) => !s.isElective).length / totalSubjects) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Electivas</span>
                      <span>{subjects.filter((s) => s.isElective).length} materias</span>
                    </div>
                    <Progress
                      value={(subjects.filter((s) => s.isElective).length / totalSubjects) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Duración</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Anuales</span>
                      <span>{subjects.filter((s) => s.duration === "anual").length} materias</span>
                    </div>
                    <Progress
                      value={(subjects.filter((s) => s.duration === "anual").length / totalSubjects) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Cuatrimestrales</span>
                      <span>{subjects.filter((s) => s.duration === "cuatrimestral").length} materias</span>
                    </div>
                    <Progress
                      value={(subjects.filter((s) => s.duration === "cuatrimestral").length / totalSubjects) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progreso por Cuatrimestre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>1er Cuatrimestre</span>
                      <span>
                        {
                          subjects.filter(
                            (s) =>
                              s.duration === "cuatrimestral" &&
                              s.semester === "primero" &&
                              userStatus[s.id] === "approved",
                          ).length
                        }{" "}
                        / {subjects.filter((s) => s.duration === "cuatrimestral" && s.semester === "primero").length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (subjects.filter(
                          (s) =>
                            s.duration === "cuatrimestral" &&
                            s.semester === "primero" &&
                            userStatus[s.id] === "approved",
                        ).length /
                          Math.max(
                            1,
                            subjects.filter((s) => s.duration === "cuatrimestral" && s.semester === "primero").length,
                          )) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>2do Cuatrimestre</span>
                      <span>
                        {
                          subjects.filter(
                            (s) =>
                              s.duration === "cuatrimestral" &&
                              s.semester === "segundo" &&
                              userStatus[s.id] === "approved",
                          ).length
                        }{" "}
                        / {subjects.filter((s) => s.duration === "cuatrimestral" && s.semester === "segundo").length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (subjects.filter(
                          (s) =>
                            s.duration === "cuatrimestral" &&
                            s.semester === "segundo" &&
                            userStatus[s.id] === "approved",
                        ).length /
                          Math.max(
                            1,
                            subjects.filter((s) => s.duration === "cuatrimestral" && s.semester === "segundo").length,
                          )) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Promedio de materias por año</h3>
                      <p className="text-sm text-muted-foreground">
                        Basado en materias aprobadas y con final pendiente
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-2xl font-bold">
                        {((approvedSubjects + pendingFinals) / Math.max(1, Object.keys(subjectsByYear).length)).toFixed(
                          1,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Tiempo estimado para graduación</h3>
                      <p className="text-sm text-muted-foreground">Basado en el ritmo actual</p>
                    </div>
                    <div className="text-xl font-bold">
                      {Math.ceil(
                        (totalSubjects - approvedSubjects) /
                          Math.max(1, approvedSubjects / Math.max(1, Object.keys(subjectsByYear).length)),
                      )}{" "}
                      años
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Porcentaje de avance</h3>
                      <p className="text-sm text-muted-foreground">Considerando solo materias aprobadas</p>
                    </div>
                    <div className="text-xl font-bold">{approvedPercentage}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingFinals > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="font-medium text-amber-800 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Prioriza tus finales pendientes
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Tienes {pendingFinals} finales pendientes. Rendir estos finales te permitirá avanzar más rápido
                        en tu carrera.
                      </p>
                    </div>
                  )}

                  {finalsImpact.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <h3 className="font-medium text-blue-800 flex items-center">
                        <Unlock className="h-4 w-4 mr-2" />
                        Final estratégico
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Rendir el final de <strong>{finalsImpact[0].name}</strong> te permitiría desbloquear{" "}
                        {finalsImpact[0].totalBlocked} materias nuevas.
                      </p>
                    </div>
                  )}

                  {availableSubjects.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <h3 className="font-medium text-green-800 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Materias disponibles
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Tienes {availableSubjects.length} materias disponibles para cursar. Considera inscribirte en el
                        próximo período.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
