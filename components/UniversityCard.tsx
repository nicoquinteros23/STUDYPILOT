import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function UniversityCard({ university }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 relative">
        <Image
          src={university.logo || "/placeholder.svg"}
          alt={university.name}
          fill
          style={{ objectFit: "contain" }}
          className="p-4"
        />
      </div>
      <CardHeader>
        <CardTitle>{university.name}</CardTitle>
        <CardDescription>{university.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">Carreras disponibles:</h3>
        <ul className="list-disc list-inside">
          {university.careers.map((career) => (
            <li key={career.id}>{career.name}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/universities/${university.id}`}>Ver Carreras</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
