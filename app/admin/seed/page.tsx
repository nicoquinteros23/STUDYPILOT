"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { seedData } from "@/scripts/seed-data"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: any } | null>(null)

  const handleSeed = async () => {
    setIsLoading(true)
    try {
      const seedResult = await seedData()
      setResult(seedResult)
    } catch (error) {
      setResult({ success: false, error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sembrar Datos Iniciales</CardTitle>
          <CardDescription>
            Esta acción creará datos iniciales en la base de datos, incluyendo universidades, carreras y materias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.success
                  ? "Los datos iniciales se han sembrado correctamente."
                  : `Error al sembrar datos: ${result.error?.message || "Error desconocido"}`}
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Nota: Esta acción solo debe ejecutarse una vez. Si ya existen datos en la base de datos, podrían duplicarse.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeed} disabled={isLoading} className="w-full">
            {isLoading ? "Sembrando datos..." : "Sembrar Datos"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
