"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export default function StudyAssistantChat({ subjects, userStatus, careerData, stats }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente de estudio. Puedo ayudarte con consultas sobre tu plan de estudios, correlatividades, estrategias de cursado y más. ¿En qué puedo ayudarte hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Preparar el contexto del estudiante para la IA
  const prepareStudentContext = () => {
    // Información general
    const generalInfo = `
      Carrera: ${careerData?.name || "No especificada"}
      Total de materias: ${stats.totalSubjects}
      Materias aprobadas: ${stats.approvedSubjects} (${stats.approvedPercentage}%)
      Materias con final pendiente: ${stats.pendingFinals}
      Materias cursando actualmente: ${stats.inProgressSubjects}
      Materias disponibles para cursar: ${stats.availableSubjects}
      Materias bloqueadas por correlatividades: ${stats.blockedSubjects}
    `

    // Información de materias aprobadas
    const approvedSubjectsInfo = subjects
      .filter((subject) => userStatus[subject.id] === "approved")
      .map((subject) => `- ${subject.name} (${subject.year}° año)`)
      .join("\n")

    // Información de materias con final pendiente
    const pendingFinalsInfo = subjects
      .filter((subject) => userStatus[subject.id] === "pendingFinal")
      .map((subject) => `- ${subject.name} (${subject.year}° año)`)
      .join("\n")

    // Información de materias cursando
    const inProgressSubjectsInfo = subjects
      .filter((subject) => userStatus[subject.id] === "inProgress")
      .map((subject) => `- ${subject.name} (${subject.year}° año)`)
      .join("\n")

    // Información de materias disponibles
    const availableSubjectsInfo = subjects
      .filter((subject) => {
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
      .map((subject) => `- ${subject.name} (${subject.year}° año)`)
      .join("\n")

    return `
      INFORMACIÓN DEL ESTUDIANTE:
      ${generalInfo}

      MATERIAS APROBADAS:
      ${approvedSubjectsInfo || "Ninguna"}

      MATERIAS CON FINAL PENDIENTE:
      ${pendingFinalsInfo || "Ninguna"}

      MATERIAS CURSANDO ACTUALMENTE:
      ${inProgressSubjectsInfo || "Ninguna"}

      MATERIAS DISPONIBLES PARA CURSAR:
      ${availableSubjectsInfo || "Ninguna"}
    `
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Añadir mensaje del usuario
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Preparar el contexto del estudiante
      const studentContext = prepareStudentContext()

      // Construir el prompt para la IA
      const systemPrompt = `
        Eres un asistente académico especializado en ayudar a estudiantes universitarios.
        Tu objetivo es proporcionar información precisa y consejos útiles sobre el plan de estudios, correlatividades, estrategias de cursado y planificación académica.
        
        Aquí está la información del estudiante con el que estás hablando:
        ${studentContext}
        
        Basándote en esta información, responde a las preguntas del estudiante de manera clara, concisa y personalizada.
        Si te preguntan sobre materias específicas, utiliza la información proporcionada para dar respuestas precisas.
        Si te preguntan sobre estrategias de cursado o planificación, ofrece recomendaciones basadas en su situación actual.
        Si no tienes suficiente información para responder una pregunta específica, indícalo claramente y sugiere qué información adicional necesitarías.
        
        Mantén un tono amigable, motivador y profesional. Recuerda que tu objetivo es ayudar al estudiante a tener éxito en su carrera universitaria.
      `

      // Generar respuesta con la IA
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: input,
        system: systemPrompt,
      })

      // Añadir respuesta de la IA
      setMessages((prev) => [...prev, { role: "assistant", content: text }])
    } catch (error) {
      console.error("Error al generar respuesta:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta nuevamente más tarde.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"} items-start gap-2`}
          >
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
            )}
            <Card
              className={`max-w-[80%] ${
                message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
              }`}
            >
              <CardContent className="p-3">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </CardContent>
            </Card>
            {message.role === "user" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot size={16} />
              </AvatarFallback>
            </Avatar>
            <Card className="max-w-[80%] bg-muted">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Pensando...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Escribe tu consulta aquí..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
