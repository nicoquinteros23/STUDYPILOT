import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock, Info } from "lucide-react"

interface Subject {
  id: string
  code: string
  name: string
  year: number
  semester: number
  credits: number
  correlativas_cursado: string[]
  correlativas_final: string[]
}

interface UserSubject {
  subject_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'pendingFinal'
}

interface Props {
  subjects: Subject[]
  userSubjects: UserSubject[]
}

function getSubjectStatus(subject: Subject, userSubjects: UserSubject[]): 'blocked' | 'available' {
  if (!subject.correlativas_cursado || subject.correlativas_cursado.length === 0) return 'available'
  const approvedIds = userSubjects.filter(us => us.status === 'completed').map(us => us.subject_id)
  const allCorrelativasAprobadas = subject.correlativas_cursado.every(correlativaId => approvedIds.includes(correlativaId))
  return allCorrelativasAprobadas ? 'available' : 'blocked'
}

function getMaxYearAndSemester(userSubjects: UserSubject[], subjects: Subject[]) {
  // Encuentra el año y semestre máximo cursado o aprobado
  let maxYear = 0
  let maxSemester = 0
  userSubjects.forEach(us => {
    if (us.status === 'in_progress' || us.status === 'completed') {
      const subj = subjects.find(s => s.id === us.subject_id)
      if (subj) {
        if (subj.year > maxYear || (subj.year === maxYear && subj.semester > maxSemester)) {
          maxYear = subj.year
          maxSemester = subj.semester
        }
      }
    }
  })
  return { maxYear, maxSemester }
}

export const CorrelativityAnalysis: React.FC<Props> = ({ subjects, userSubjects }) => {
  // LOG: Mostrar userSubjects completos
  console.log('userSubjects:', userSubjects);
  // LOG: Mostrar todos los IDs de subjects
  console.log('subject IDs:', subjects.map(s => s.id));
  // LOG: Mostrar todos los subject_id de userSubjects y sus estados
  userSubjects.forEach(us => {
    console.log(`userSubject: subject_id=${us.subject_id}, status=${us.status}`);
  });

  // IDs de materias a excluir (aprobadas, en curso o con final pendiente)
  const excludedIds = new Set(
    userSubjects
      .filter(us => ['completed', 'in_progress', 'pendingFinal'].includes(us.status))
      .map(us => String(us.subject_id).trim())
  );

  // DEBUG: Mostrar excludedIds
  console.log('excludedIds:', Array.from(excludedIds));

  // Filtrar materias disponibles y bloqueadas asegurando que los IDs coincidan exactamente
  const blockedSubjects = subjects.filter(s => {
    const id = String(s.id).trim();
    const isBlocked = getSubjectStatus(s, userSubjects) === 'blocked';
    const isExcluded = excludedIds.has(id);
    return isBlocked && !isExcluded;
  });

  const availableSubjects = subjects.filter(s => {
    const id = String(s.id).trim();
    const isAvailable = getSubjectStatus(s, userSubjects) === 'available';
    const isExcluded = excludedIds.has(id);
    return isAvailable && !isExcluded;
  });

  // DEBUG: Mostrar materias disponibles y bloqueadas después del filtrado
  console.log('availableSubjects:', availableSubjects.map(s => s.name));
  console.log('blockedSubjects:', blockedSubjects.map(s => s.name));

  // Detectar materias "siguientes"
  const { maxYear, maxSemester } = getMaxYearAndSemester(userSubjects, subjects)
  const nextSubjects = availableSubjects.filter(s =>
    (s.year === maxYear && s.semester > maxSemester) ||
    (s.year === maxYear + 1 && s.semester === 1)
  )

  // Detectar materias "siguientes bloqueadas":
  // Son las bloqueadas del año siguiente o del siguiente cuatrimestre
  const nextBlockedSubjects = blockedSubjects.filter(s =>
    (s.year === maxYear && s.semester > maxSemester) ||
    (s.year === maxYear + 1 && s.semester === 1)
  )

  // Para cada materia siguiente, determinar qué correlativas faltan aprobar
  function getCorrelativasFaltantes(subject: Subject) {
    const aprobadas = new Set(userSubjects.filter(us => us.status === 'completed').map(us => us.subject_id))
    const cursando = new Set(userSubjects.filter(us => us.status === 'in_progress').map(us => us.subject_id))
    const finalesPendientes = new Set(userSubjects.filter(us => us.status === 'pendingFinal').map(us => us.subject_id))
    return subject.correlativas_cursado.map(corId => {
      if (aprobadas.has(corId)) return null
      if (cursando.has(corId)) return { id: corId, tipo: 'cursando' }
      if (finalesPendientes.has(corId)) return { id: corId, tipo: 'finalPendiente' }
      return { id: corId, tipo: 'faltaAprobar' }
    }).filter(Boolean)
  }

  // Estadísticas
  const stats = {
    sinCorrelativas: subjects.filter(s => !s.correlativas_cursado || s.correlativas_cursado.length === 0).length,
    conCorrelativasParaCursar: subjects.filter(s => s.correlativas_cursado && s.correlativas_cursado.length > 0).length,
    conCorrelativasParaFinal: subjects.filter(s => s.correlativas_final && s.correlativas_final.length > 0).length,
  }

  // Materias con más dependencias (cuántas materias dependen de cada una)
  const dependencias: Record<string, number> = {}
  subjects.forEach(s => {
    s.correlativas_cursado.forEach(correlativaId => {
      dependencias[String(correlativaId).trim()] = (dependencias[String(correlativaId).trim()] || 0) + 1
    })
    s.correlativas_final.forEach(correlativaId => {
      dependencias[String(correlativaId).trim()] = (dependencias[String(correlativaId).trim()] || 0) + 1
    })
  })
  const subjectsWithDependencies = subjects
    .map(s => ({ ...s, dependencias: dependencias[String(s.id).trim()] || 0 }))
    .filter(s => s.dependencias > 0)
    .sort((a, b) => b.dependencias - a.dependencias)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Estado de Correlatividades */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Correlatividades</CardTitle>
          <CardDescription>Análisis de materias bloqueadas y disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Materias Disponibles para cursar</h3>
              <div className="max-h-56 overflow-y-auto border rounded-md bg-muted/30">
                <ul className="pl-4 list-disc text-sm">
                  {availableSubjects.length === 0 && (
                    <li className="text-muted-foreground">No hay materias disponibles para cursar.</li>
                  )}
                  {availableSubjects.map(s => (
                    <li key={s.id} className={nextSubjects.includes(s) ? "font-bold text-blue-700" : ""}>
                      {s.name} - {s.year}° año, {s.semester}° cuatrimestre
                      {nextSubjects.includes(s) && <Badge className="ml-2" variant="outline">Siguiente en tu trayectoria</Badge>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Materias Bloqueadas</h3>
              <div className="max-h-56 overflow-y-auto border rounded-md bg-muted/30">
                <ul className="pl-4 list-disc text-sm">
                  {blockedSubjects.length === 0 && (
                    <li className="text-muted-foreground">No hay materias bloqueadas.</li>
                  )}
                  {blockedSubjects.map(s => (
                    <li key={s.id}>
                      {s.name} - {s.year}° año, {s.semester}° cuatrimestre
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa de Correlatividades */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Correlatividades</CardTitle>
          <CardDescription>Visualización de dependencias entre materias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-2 rounded bg-blue-50 dark:bg-blue-900/20">
            <div className="font-semibold mb-1">Estadísticas de correlatividades</div>
            <ul className="text-xs">
              <li>Materias sin correlativas: <span className="font-bold">{stats.sinCorrelativas}</span></li>
              <li>Materias con correlativas para cursar: <span className="font-bold">{stats.conCorrelativasParaCursar}</span></li>
              <li>Materias con correlativas para final: <span className="font-bold">{stats.conCorrelativasParaFinal}</span></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1">Materias con más dependencias</div>
            <div className="max-h-40 overflow-y-auto border rounded-md bg-muted/30">
              <ul className="text-xs">
                {subjectsWithDependencies.length === 0 && (
                  <li className="text-muted-foreground">No hay materias con dependencias.</li>
                )}
                {subjectsWithDependencies.slice(0, 5).map(s => (
                  <li key={s.id} className="flex justify-between items-center">
                    <span>{s.name} <span className="text-muted-foreground text-xs">({s.year}° Año)</span></span>
                    <Badge variant="outline">{s.dependencias} dependencias</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CorrelativityAnalysis; 