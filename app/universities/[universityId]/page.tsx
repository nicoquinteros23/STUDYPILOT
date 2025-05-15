"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Datos de ejemplo para las universidades
const universities = {
  utn: {
    id: "utn",
    name: "Universidad Tecnológica Nacional (UTN)",
    description: "Una de las principales universidades de ingeniería de Argentina.",
    logo: "/images/utn-logo.png",
    careers: [
      {
        id: "sistemas",
        name: "Ingeniería en Sistemas de Información",
        description: "Forma profesionales capaces de analizar, diseñar, implementar y evaluar sistemas de información.",
        duration: "5 años",
      },
    ],
  },
}

export default function UniversityPage() {
  const params = useParams()
  const universityId = params.universityId

  const university = universities[universityId]

  if (!university) {
    return <div>Universidad no encontrada</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative h-24 w-24">
          <Image
            src={university.logo || "/placeholder.svg"}
            alt={university.name}
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{university.name}</h1>
          <p className="text-lg text-muted-foreground">{university.description}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Carreras Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {university.careers.map((career) => (
          <Card key={career.id}>
            <CardHeader>
              <CardTitle>{career.name}</CardTitle>
              <CardDescription>Duración: {career.duration}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{career.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/universities/${universityId}/careers/${career.id}`}>Ver Plan de Estudios</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
