import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Send, Mail, User, MessageSquare } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Contacto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Envíanos tu mensaje</CardTitle>
              <CardDescription>
                Completa el formulario para enviar sugerencias, reportar errores o solicitar nuevas funcionalidades.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Tu nombre" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="tu@email.com" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="subject" placeholder="Asunto de tu mensaje" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe tu sugerencia, error o solicitud de funcionalidad..."
                    rows={5}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" /> Enviar mensaje
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
              <CardDescription>Otras formas de ponerte en contacto con el equipo de desarrollo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Correo electrónico</h3>
                <p className="text-sm text-muted-foreground">soporte@studypilot.com</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">GitHub</h3>
                <p className="text-sm text-muted-foreground">
                  Puedes contribuir directamente al proyecto o reportar problemas en nuestro
                  <a href="https://github.com/studypilot/app" className="text-primary hover:underline ml-1">
                    repositorio de GitHub
                  </a>
                  .
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Redes sociales</h3>
                <div className="flex space-x-4 mt-2">
                  <Button variant="outline" size="icon" asChild>
                    <a href="https://twitter.com/studypilot" target="_blank" rel="noopener noreferrer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                      <span className="sr-only">Twitter</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href="https://instagram.com/studypilot" target="_blank" rel="noopener noreferrer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                      </svg>
                      <span className="sr-only">Instagram</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href="https://linkedin.com/company/studypilot" target="_blank" rel="noopener noreferrer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect width="4" height="12" x="2" y="9"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preguntas frecuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-medium mb-1">¿Cómo puedo sugerir una nueva funcionalidad?</h3>
                <p className="text-sm text-muted-foreground">
                  Puedes utilizar el formulario de contacto o crear un issue en nuestro repositorio de GitHub.
                </p>
              </div>
              <div className="border-b pb-3">
                <h3 className="font-medium mb-1">¿Cuánto tiempo tarda en implementarse una sugerencia?</h3>
                <p className="text-sm text-muted-foreground">
                  El tiempo varía según la complejidad de la funcionalidad y nuestra carga de trabajo actual.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">¿Puedo contribuir al desarrollo?</h3>
                <p className="text-sm text-muted-foreground">
                  ¡Absolutamente! Aceptamos pull requests en nuestro repositorio de GitHub.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
