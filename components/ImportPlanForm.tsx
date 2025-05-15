"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Upload } from "lucide-react"

export default function ImportPlanForm({ onImport }) {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile)
      setError("")
    } else {
      setFile(null)
      setError("Por favor selecciona un archivo JSON válido")
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo JSON válido")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Leer el archivo
      const fileContent = await readFileAsText(file)
      const jsonData = JSON.parse(fileContent)

      // Validar la estructura del JSON
      if (!Array.isArray(jsonData)) {
        throw new Error("El archivo debe contener un array de materias")
      }

      // Convertir el formato del JSON al formato de la aplicación
      const convertedSubjects = jsonData.map((item) => {
        // Validar campos requeridos
        if (!item.id || !item.nombre || !item.anio) {
          throw new Error(`Materia con datos incompletos: ${JSON.stringify(item)}`)
        }

        // Convertir correlativas a formato de prerrequisitos
        const prerequisites = Array.isArray(item.correlativasCursado)
          ? item.correlativasCursado.map((id) => id.toString())
          : []

        const finalPrerequisites = Array.isArray(item.correlativasFinal)
          ? item.correlativasFinal.map((id) => id.toString())
          : []

        return {
          id: item.id.toString(),
          name: item.nombre,
          year: item.anio.toString(),
          prerequisites: prerequisites,
          finalPrerequisites: finalPrerequisites,
          professor: "",
          schedules: [],
          duration: "cuatrimestral",
          semester: "primero",
          description: "",
          isElective: false,
          commission: "",
        }
      })

      // Llamar a la función de importación proporcionada por el componente padre
      onImport(convertedSubjects)
      setSuccess(`Se han importado ${convertedSubjects.length} materias correctamente`)
    } catch (err) {
      setError(`Error al procesar el archivo: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para leer el archivo como texto
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Plan de Estudios</CardTitle>
        <CardDescription>Carga un archivo JSON con tu plan de estudios para importarlo automáticamente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="plan-file">Archivo JSON</Label>
            <Input id="plan-file" type="file" accept=".json" onChange={handleFileChange} />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-800">Formato esperado:</h3>
            <pre className="text-xs text-blue-700 mt-1 overflow-x-auto">
              {`[
  {
    "id": "1",
    "nombre": "Álgebra y Geometría Analítica",
    "anio": 1,
    "correlativasCursado": [],
    "correlativasFinal": []
  },
  {
    "id": "2",
    "nombre": "Análisis Matemático I",
    "anio": 1,
    "correlativasCursado": ["1"],
    "correlativasFinal": ["1"]
  }
]`}
            </pre>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Éxito</AlertTitle>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={!file || isLoading} className="w-full">
          {isLoading ? "Importando..." : "Importar Plan de Estudios"}
          {!isLoading && <Upload className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
