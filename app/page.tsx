import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Datos de ejemplo para las universidades
const universities = [
  {
    id: "utn",
    name: "Universidad Tecnológica Nacional (UTN)",
    description: "Una de las principales universidades de ingeniería de Argentina.",
    logo: "/images/utn-logo.png",
    careers: [
      {
        id: "sistemas",
        name: "Ingeniería en Sistemas de Información",
      },
    ],
  },
]

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a StudyPilot</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Gestiona tu plan de estudios, horarios y obtén un resumen de tu progreso académico.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Universidades Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {universities.map((university) => (
          <Card key={university.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Image
                  src={university.logo || "/placeholder.svg"}
                  alt={university.name}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
              <CardTitle className="text-center">{university.name}</CardTitle>
              <CardDescription className="text-center">{university.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Carreras disponibles:</h3>
              <ul className="list-disc list-inside">
                {university.careers.map((career) => (
                  <li key={career.id}>{career.name}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href={`/universities/${university.id}`}>Ver Carreras</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
