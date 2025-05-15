"use client"

import { useState, useCallback, useMemo } from "react"
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState, MarkerType, Panel } from "reactflow"
import "reactflow/dist/style.css"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, BookOpen, Lock, Unlock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Nodo personalizado para las materias
const SubjectNode = ({ data }) => {
  return (
    <div
      className={`px-4 py-2 rounded-md shadow-md border ${
        data.status === "approved"
          ? "bg-green-100 border-green-300"
          : data.status === "inProgress"
            ? "bg-yellow-100 border-yellow-300"
            : data.status === "pendingFinal"
              ? "bg-blue-100 border-blue-300"
              : data.status === "blocked"
                ? "bg-red-100 border-red-300"
                : "bg-gray-100 border-gray-300"
      }`}
    >
      <div className="font-medium text-sm">{data.label}</div>
      <div className="text-xs text-muted-foreground">{data.year}° Año</div>
    </div>
  )
}

const nodeTypes = {
  subject: SubjectNode,
}

export default function CareerMap({ subjects, userStatus }) {
  const [selectedNode, setSelectedNode] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  // Función para determinar si una materia está bloqueada
  const isSubjectBlocked = useCallback(
    (subject) => {
      // Si ya está aprobada, cursando o con final pendiente, no está bloqueada
      if (
        userStatus[subject.id] === "approved" ||
        userStatus[subject.id] === "inProgress" ||
        userStatus[subject.id] === "pendingFinal"
      )
        return false

      // Si no tiene prerrequisitos, no está bloqueada
      if (!subject.prerequisites || subject.prerequisites.length === 0) return false

      // Está bloqueada si al menos uno de sus prerrequisitos no está aprobado o con final pendiente
      return subject.prerequisites.some(
        (prereqId) =>
          !userStatus[prereqId] || (userStatus[prereqId] !== "approved" && userStatus[prereqId] !== "pendingFinal"),
      )
    },
    [userStatus],
  )

  // Crear nodos y aristas para el grafo
  const { nodes, edges } = useMemo(() => {
    // Crear un mapa para acceder rápidamente a las materias por ID
    const subjectMap = {}
    subjects.forEach((subject) => {
      subjectMap[subject.id] = subject
    })

    // Crear nodos
    const nodes = subjects.map((subject, index) => {
      // Determinar el estado de la materia
      let status = userStatus[subject.id] || "notStarted"
      if (status === "notStarted" && isSubjectBlocked(subject)) {
        status = "blocked"
      }

      // Calcular posición inicial (organizar por año y semestre)
      const year = Number.parseInt(subject.year) || 1
      const xOffset = subject.semester === "segundo" ? 300 : 0
      const ySpacing = 100
      const xSpacing = 200

      // Ajustar posición vertical según el índice dentro del mismo año
      const sameYearSubjects = subjects.filter((s) => s.year === subject.year)
      const yearIndex = sameYearSubjects.indexOf(subject)

      return {
        id: subject.id,
        type: "subject",
        position: {
          x: (year - 1) * xSpacing + xOffset,
          y: yearIndex * ySpacing + 50,
        },
        data: {
          label: subject.name,
          year: subject.year,
          status,
          subject,
        },
      }
    })

    // Crear aristas (conexiones entre materias)
    const edges = []
    subjects.forEach((subject) => {
      if (subject.prerequisites && subject.prerequisites.length > 0) {
        subject.prerequisites.forEach((prereqId) => {
          // Verificar que el prerrequisito existe
          if (subjectMap[prereqId]) {
            edges.push({
              id: `${prereqId}-${subject.id}`,
              source: prereqId,
              target: subject.id,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
              },
              style: {
                strokeWidth: 1.5,
                stroke: "#999",
              },
            })
          }
        })
      }
    })

    return { nodes, edges }
  }, [subjects, userStatus, isSubjectBlocked])

  // Estados para los nodos y aristas con capacidad de arrastrar
  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes)
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges)

  // Manejar clic en un nodo
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setShowDetails(true)
  }, [])

  // Obtener el nombre de una materia por su ID
  const getSubjectNameById = useCallback(
    (id) => {
      const subject = subjects.find((s) => s.id === id)
      return subject ? subject.name : `ID: ${id}`
    },
    [subjects],
  )

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "inProgress":
        return "bg-yellow-500"
      case "pendingFinal":
        return "bg-blue-500"
      case "blocked":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Aprobada"
      case "inProgress":
        return "Cursando"
      case "pendingFinal":
        return "Final Pendiente"
      case "blocked":
        return "Bloqueada"
      default:
        return "No Cursada"
    }
  }

  // Función para obtener el icono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "inProgress":
        return <BookOpen className="h-4 w-4 text-yellow-500" />
      case "pendingFinal":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "blocked":
        return <Lock className="h-4 w-4 text-red-500" />
      default:
        return <Unlock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="w-full h-[600px]">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeColor={(node) => {
            switch (node.data.status) {
              case "approved":
                return "#10b981" // green
              case "inProgress":
                return "#f59e0b" // yellow
              case "pendingFinal":
                return "#3b82f6" // blue
              case "blocked":
                return "#ef4444" // red
              default:
                return "#9ca3af" // gray
            }
          }}
        />
        <Background variant="dots" gap={12} size={1} />

        <Panel position="top-left" className="bg-white p-2 rounded-md shadow-md">
          <div className="text-sm font-medium mb-2">Leyenda</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Aprobada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Cursando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Final Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Bloqueada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-xs">No Cursada</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Diálogo de detalles de la materia */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Materia</DialogTitle>
            <DialogDescription>Información detallada sobre la materia seleccionada</DialogDescription>
          </DialogHeader>

          {selectedNode && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedNode.data.label}</h2>
                  <p className="text-muted-foreground">{selectedNode.data.year}° Año</p>
                </div>
                <Badge className={`${getStatusColor(selectedNode.data.status)} text-white`}>
                  {getStatusText(selectedNode.data.status)}
                </Badge>
              </div>

              {selectedNode.data.subject.description && (
                <div>
                  <h3 className="text-sm font-medium">Descripción</h3>
                  <p className="text-sm">{selectedNode.data.subject.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium">Correlativas para cursar</h3>
                {selectedNode.data.subject.prerequisites && selectedNode.data.subject.prerequisites.length > 0 ? (
                  <ul className="list-disc list-inside text-sm">
                    {selectedNode.data.subject.prerequisites.map((prereqId) => (
                      <li key={prereqId} className="flex items-center gap-1">
                        {getStatusIcon(userStatus[prereqId] || "notStarted")}
                        <span>{getSubjectNameById(prereqId)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tiene correlativas para cursar</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium">Correlativas para rendir final</h3>
                {selectedNode.data.subject.finalPrerequisites &&
                selectedNode.data.subject.finalPrerequisites.length > 0 ? (
                  <ul className="list-disc list-inside text-sm">
                    {selectedNode.data.subject.finalPrerequisites.map((prereqId) => (
                      <li key={prereqId} className="flex items-center gap-1">
                        {getStatusIcon(userStatus[prereqId] || "notStarted")}
                        <span>{getSubjectNameById(prereqId)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tiene correlativas para rendir final</p>
                )}
              </div>

              {/* Materias que dependen de esta */}
              <div>
                <h3 className="text-sm font-medium">Materias que requieren esta materia</h3>
                {subjects.filter(
                  (s) =>
                    (s.prerequisites && s.prerequisites.includes(selectedNode.data.subject.id)) ||
                    (s.finalPrerequisites && s.finalPrerequisites.includes(selectedNode.data.subject.id)),
                ).length > 0 ? (
                  <ul className="list-disc list-inside text-sm">
                    {subjects
                      .filter(
                        (s) =>
                          (s.prerequisites && s.prerequisites.includes(selectedNode.data.subject.id)) ||
                          (s.finalPrerequisites && s.finalPrerequisites.includes(selectedNode.data.subject.id)),
                      )
                      .map((subject) => (
                        <li key={subject.id}>{subject.name}</li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Ninguna materia depende de esta</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
