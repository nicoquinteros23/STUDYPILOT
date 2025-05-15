"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("Estado actual del usuario:", user)
    
    if (!user) {
      console.log("No hay usuario, redirigiendo a login")
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    console.log("Intentando cerrar sesión")
    try {
      await signOut()
      console.log("Sesión cerrada exitosamente")
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email:</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ID de Usuario:</p>
            <p className="text-sm">{user.id}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 