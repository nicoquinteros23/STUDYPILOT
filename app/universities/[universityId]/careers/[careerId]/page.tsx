"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SubjectList from "@/components/SubjectList"
import SubjectForm from "@/components/SubjectForm"

// Datos de ejemplo para el plan de estudios de Ingeniería en Sistemas de la UTN
const careerPlans = {
  "utn-sistemas": {
    name: "Ingeniería en Sistemas de Información - UTN",
    defaultSubjects: [
      {
        id: "analisis-matematico-1",
        name: "Análisis Matemático I",
        prerequisites: [],
        professor: "Dr. Martínez",
        schedules: [
          { day: "Lunes", startTime: "8:00", endTime: "9:30" },
          { day: "Miércoles", startTime: "8:00", endTime: "9:30" },
        ],
        duration: "anual",
        description: "Cálculo diferencial e integral de una variable.",
        year: "1",
        isElective: false,
        commission: "K1001",
      },
      {
        id: "algebra-geometria",
        name: "Álgebra y Geometría Analítica",
        prerequisites: [],
        professor: "Dra. Rodríguez",
        schedules: [
          { day: "Martes", startTime: "10:00", endTime: "11:30" },
          { day: "Jueves", startTime: "10:00", endTime: "11:30" },
        ],
        duration: "anual",
        description: "Álgebra lineal y geometría analítica.",
        year: "1",
        isElective: false,
        commission: "K1002",
      },
      {
        id: "sistemas-organizaciones",
        name: "Sistemas y Organizaciones",
        prerequisites: [],
        professor: "Ing. López",
        schedules: [{ day: "Viernes", startTime: "14:00", endTime: "17:00" }],
        duration: "cuatrimestral",
        semester: "primero",
        description: "Introducción a los sistemas de información y las organizaciones.",
        year: "1",
        isElective: false,
        commission: "K1003",
      },
      {
        id: "algoritmos-estructuras",
        name: "Algoritmos y Estructuras de Datos",
        prerequisites: [],
        professor: "Ing. García",
        schedules: [
          { day: "Lunes", startTime: "14:00", endTime: "15:30" },
          { day: "Miércoles", startTime: "14:00", endTime: "15:30" },
        ],
        duration: "anual",
        description: "Diseño de algoritmos y estructuras de datos fundamentales.",
        year: "1",
        isElective: false,
        commission: "K1004",
      },
      {
        id: "arquitectura-computadoras",
        name: "Arquitectura de Computadoras",
        prerequisites: [],
        professor: "Ing. Fernández",
        schedules: [
          { day: "Martes", startTime: "16:00", endTime: "17:30" },
          { day: "Jueves", startTime: "16:00", endTime: "17:30" },
        ],
        duration: "anual",
        description: "Organización y arquitectura de computadoras.",
        year: "1",
        isElective: false,
        commission: "K1005",
      },
      {
        id: "analisis-matematico-2",
        name: "Análisis Matemático II",
        prerequisites: ["analisis-matematico-1"],
        professor: "Dr. Sánchez",
        schedules: [
          { day: "Lunes", startTime: "10:00", endTime: "11:30" },
          { day: "Miércoles", startTime: "10:00", endTime: "11:30" },
        ],
        duration: "anual",
        description: "Cálculo diferencial e integral de varias variables.",
        year: "2",
        isElective: false,
        commission: "K2001",
      },
      {
        id: "probabilidad-estadistica",
        name: "Probabilidad y Estadística",
        prerequisites: ["analisis-matematico-1"],
        professor: "Dra. Gómez",
        schedules: [
          { day: "Martes", startTime: "8:00", endTime: "9:30" },
          { day: "Jueves", startTime: "8:00", endTime: "9:30" },
        ],
        duration: "anual",
        description: "Teoría de la probabilidad y estadística aplicada.",
        year: "2",
        isElective: false,
        commission: "K2002",
      },
      {
        id: "sistemas-representacion",
        name: "Sistemas de Representación",
        prerequisites: [],
        professor: "Arq. Pérez",
        schedules: [{ day: "Viernes", startTime: "8:00", endTime: "11:15" }],
        duration: "cuatrimestral",
        semester: "primero",
        description: "Técnicas de representación gráfica.",
        year: "2",
        isElective: false,
        commission: "K2003",
      },
      {
        id: "paradigmas-programacion",
        name: "Paradigmas de Programación",
        prerequisites: ["algoritmos-estructuras"],
        professor: "Ing. Torres",
        schedules: [{ day: "Lunes", startTime: "16:00", endTime: "19:15" }],
        duration: "anual",
        description: "Estudio de diferentes paradigmas de programación.",
        year: "2",
        isElective: false,
        commission: "K2004",
      },
      {
        id: "ingenieria-software-1",
        name: "Ingeniería de Software I",
        prerequisites: ["sistemas-organizaciones", "algoritmos-estructuras"],
        professor: "Ing. Ramírez",
        schedules: [{ day: "Martes", startTime: "14:00", endTime: "17:15" }],
        duration: "anual",
        description: "Fundamentos de la ingeniería de software.",
        year: "3",
        isElective: false,
        commission: "K3001",
      },
      {
        id: "diseno-sistemas",
        name: "Diseño de Sistemas",
        prerequisites: ["paradigmas-programacion"],
        professor: "Ing. Morales",
        schedules: [{ day: "Miércoles", startTime: "18:00", endTime: "21:15" }],
        duration: "anual",
        description: "Metodologías y técnicas para el diseño de sistemas.",
        year: "3",
        isElective: false,
        commission: "K3002",
      },
    ],
  },
}

export default function CareerPage() {
  const params = useParams()
  const router = useRouter()
  const universityId = params.universityId
  const careerId = params.careerId
  const careerKey = `${universityId}-${careerId}`

  const [subjects, setSubjects] = useState([])
  const [userStatus, setUserStatus] = useState({})
  const [initialized, setInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState("subjects")

  useEffect(() => {
    // Intentar cargar desde localStorage primero
    const storedSubjects = localStorage.getItem(`subjects-${careerKey}`)
    const storedUserStatus = localStorage.getItem(`userStatus-${careerKey}`)

    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects))
      if (storedUserStatus) {
        setUserStatus(JSON.parse(storedUserStatus))
      }
    } else {
      // Si no hay datos en localStorage, cargar los datos predeterminados
      const defaultPlan = careerPlans[careerKey]
      if (defaultPlan) {
        const defaultSubjects = defaultPlan.defaultSubjects
        setSubjects(defaultSubjects)

        // También guardar en localStorage para futuras cargas
        localStorage.setItem(`subjects-${careerKey}`, JSON.stringify(defaultSubjects))

        // Guardar también en el localStorage general para que otras páginas puedan acceder
        localStorage.setItem("subjects", JSON.stringify(defaultSubjects))
      }
    }

    setInitialized(true)
  }, [careerKey])

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(`subjects-${careerKey}`, JSON.stringify(subjects))
      localStorage.setItem(`userStatus-${careerKey}`, JSON.stringify(userStatus))
    }
  }, [subjects, userStatus, careerKey, initialized])

  const addSubject = (newSubject) => {
    setSubjects([...subjects, newSubject])
  }

  const updateSubject = (updatedSubject) => {
    setSubjects(subjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)))
  }

  const deleteSubject = (subjectId) => {
    // Verificar si hay materias que dependen de esta
    const dependentSubjects = subjects.filter(
      (subject) => subject.prerequisites && subject.prerequisites.includes(subjectId),
    )

    if (dependentSubjects.length > 0) {
      alert(
        `No se puede eliminar esta materia porque es prerrequisito de: ${dependentSubjects
          .map((s) => s.name)
          .join(", ")}`,
      )
      return
    }

    // Eliminar la materia
    setSubjects(subjects.filter((subject) => subject.id !== subjectId))

    // Eliminar el estado del usuario para esta materia
    const newUserStatus = { ...userStatus }
    delete newUserStatus[subjectId]
    setUserStatus(newUserStatus)
  }

  const updateUserStatus = (subjectId, status) => {
    setUserStatus({ ...userStatus, [subjectId]: status })
  }

  const careerPlan = careerPlans[careerKey]
  if (!careerPlan && !initialized) {
    return <div>Cargando...</div>
  }

  if (!careerPlan && initialized && subjects.length === 0) {
    return <div>Plan de estudios no encontrado</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{careerPlan ? careerPlan.name : `Plan de Estudios - ${careerId}`}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="subjects">Materias del Plan</TabsTrigger>
          <TabsTrigger value="add">Agregar Materia</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Materias del Plan de Estudios</CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectList
                subjects={subjects}
                userStatus={userStatus}
                updateUserStatus={updateUserStatus}
                updateSubject={updateSubject}
                deleteSubject={deleteSubject}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nueva Materia</CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectForm addSubject={addSubject} existingSubjects={subjects} userStatus={userStatus} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button onClick={() => router.push(`/universities/${universityId}`)}>Volver a la lista de carreras</Button>
      </div>
    </div>
  )
}
