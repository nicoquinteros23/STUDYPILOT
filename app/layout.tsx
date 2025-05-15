import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import Navbar from "@/components/Navbar"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { StudyPlanProvider } from "@/contexts/StudyPlanContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Plan de Estudios",
  description: "Gestiona tu plan de estudios universitario",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <StudyPlanProvider>
              <Navbar />
              <main className="container mx-auto p-4">{children}</main>
              <Toaster />
            </StudyPlanProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
