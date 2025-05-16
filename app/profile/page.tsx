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
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Upload, Camera } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  university?: string
  career?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [university, setUniversity] = useState("")
  const [career, setCareer] = useState("")
  const [uploading, setUploading] = useState(false)
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
        setUniversity(profile?.university || "")
        setCareer(profile?.career || "")
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
            university: university,
            career: career,
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
            university: university,
            career: career,
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.')
      }

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${profile?.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile?.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      
      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil ha sido actualizada exitosamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error al subir la imagen",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
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
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
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
                      <div className="space-y-2">
                        <Label htmlFor="university">Universidad</Label>
                        <Input
                          id="university"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder="Tu universidad"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="career">Carrera</Label>
                        <Input
                          id="career"
                          value={career}
                          onChange={(e) => setCareer(e.target.value)}
                          placeholder="Tu carrera"
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
                            setUniversity(profile?.university || "")
                            setCareer(profile?.career || "")
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
                        <h3 className="text-sm font-medium">Universidad</h3>
                        <p className="text-sm text-muted-foreground">
                          {profile?.university || "No especificada"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Carrera</h3>
                        <p className="text-sm text-muted-foreground">
                          {profile?.career || "No especificada"}
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