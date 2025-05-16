"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Home, User, LogOut, BookOpen, Settings, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Asegurarse de que el componente esté montado para evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Obtener el perfil del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) throw error
        setProfile(profile)
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [user])

  const getUserInitials = () => {
    if (!user || !user.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  const isAdmin = user?.user_metadata?.is_admin

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <Home className="h-5 w-5" />
          StudyPilot
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/review" className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Resumen</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/subjects" className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Administrar Materias</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="secondary" size="sm" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white border-primary-foreground hover:bg-gray-100">
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background text-foreground">
              <DropdownMenuItem>
                <Link href="/" className="w-full text-foreground">
                  Inicio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/study-plan" className="w-full text-foreground">
                  Ver plan de estudios
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/admin/subjects" className="w-full text-foreground">
                      Administrar Materias
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin/settings" className="w-full text-foreground">
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
