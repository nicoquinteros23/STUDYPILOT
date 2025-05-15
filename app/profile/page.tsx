"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError
        
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        setProfile(profile)
        setFullName(profile?.full_name || "")
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router, toast])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Verificar si el perfil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(checkError.message)
      }

      let updatedProfile

      if (!existingProfile) {
        // Si el perfil no existe, crearlo
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) throw new Error(insertError.message)
        updatedProfile = newProfile
      } else {
        // Si el perfil existe, actualizarlo
        const { data: modifiedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({ 
            full_name: fullName,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message)
        updatedProfile = modifiedProfile
      }

      if (!updatedProfile) {
        throw new Error("No se pudo obtener el perfil actualizado")
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente.",
      })

      setIsEditing(false)
      setProfile(updatedProfile)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error al actualizar el perfil",
        description: error.message || "Ocurrió un error al actualizar tu perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      router.push("/auth/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Cargando...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profile?.full_name || "Usuario"}
                </CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <div className="space-y-4">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setFullName(profile?.full_name || "")
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">Nombre completo</h3>
                        <p className="text-sm text-muted-foreground">
                          {profile?.full_name || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Email</h3>
                        <p className="text-sm text-muted-foreground">
                          {profile?.email}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Miembro desde</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profile?.created_at || "").toLocaleDateString()}
                        </p>
                      </div>
                      <Button onClick={() => setIsEditing(true)}>
                        Editar perfil
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Cuenta</h3>
                    <Button
                      variant="destructive"
                      onClick={handleSignOut}
                    >
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 