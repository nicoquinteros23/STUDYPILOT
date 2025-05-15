"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StudyPlanPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/universities/utn/careers/sistemas")
  }, [router])

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Redirigiendo...</h2>
        <p className="text-muted-foreground">
          Serás redirigido al plan de estudios de Ingeniería en Sistemas de la UTN.
        </p>
      </div>
    </div>
  )
}
