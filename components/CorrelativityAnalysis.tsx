import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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

function getSubjectStatus(subject: Subject, userSubjects: UserSubject[], subjects: Subject[]): 'blocked' | 'available' {
  // Asegurarse de que correlativas_cursado sea un array
  const correlativas = Array.isArray(subject.correlativas_cursado) 
    ? subject.correlativas_cursado 
    : subject.correlativas_cursado 
      ? [subject.correlativas_cursado] 
      : [];

  // Si no tiene correlativas, está disponible
  if (correlativas.length === 0) {
    return 'available';
  }
  
  // Obtener IDs de materias aprobadas y en curso
  const approvedIds = new Set(
    userSubjects
      .filter(us => ['completed', 'in_progress'].includes(us.status))
      .map(us => String(us.subject_id).trim())
  );

  // Crear un mapa de códigos de materia a IDs
  const subjectCodeToId = new Map(
    subjects.map(s => [String(s.code).trim(), String(s.id).trim()])
  );

  // Verificar si todas las correlativas están aprobadas o en curso
  const allCorrelativasAprobadas = correlativas.every(correlativaCode => {
    const correlativaId = subjectCodeToId.get(String(correlativaCode).trim());
    return correlativaId && approvedIds.has(correlativaId);
  });

  // Log para debugging
  if (!allCorrelativasAprobadas) {
    console.log(`Materia ${subject.name} está bloqueada porque:`, {
      correlativas,
      approvedIds: Array.from(approvedIds),
      correlativasFaltantes: correlativas.filter(corCode => {
        const corId = subjectCodeToId.get(String(corCode).trim());
        return !corId || !approvedIds.has(corId);
      }).map(corCode => {
        const corId = subjectCodeToId.get(String(corCode).trim());
        return {
          codigo: corCode,
          id: corId,
          aprobada: corId ? approvedIds.has(corId) : false
        };
      })
    });
  }
  
  return allCorrelativasAprobadas ? 'available' : 'blocked';
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
  // Normalizar y validar los datos de entrada
  const normalizedSubjects = subjects.map(subject => ({
    ...subject,
    correlativas_cursado: Array.isArray(subject.correlativas_cursado) 
      ? subject.correlativas_cursado 
      : subject.correlativas_cursado 
        ? [subject.correlativas_cursado] 
        : [],
    correlativas_final: Array.isArray(subject.correlativas_final)
      ? subject.correlativas_final
      : subject.correlativas_final
        ? [subject.correlativas_final]
        : []
  }));

  // Log detallado de los datos de entrada
  console.log('Datos de entrada:', {
    totalSubjects: normalizedSubjects.length,
    userSubjects: userSubjects.map(us => ({
      subject_id: us.subject_id,
      status: us.status
    })),
    sampleSubjects: normalizedSubjects.slice(0, 3).map(s => ({
      id: s.id,
      name: s.name,
      correlativas_cursado: s.correlativas_cursado,
      correlativas_final: s.correlativas_final
    }))
  });

  // IDs de materias a excluir (aprobadas, en curso o con final pendiente)
  const excludedIds = new Set(
    userSubjects
      .filter(us => ['completed', 'in_progress', 'pendingFinal'].includes(us.status))
      .map(us => String(us.subject_id).trim())
  );

  console.log('Materias excluidas:', Array.from(excludedIds));

  // Filtrar materias disponibles y bloqueadas
  const blockedSubjects = normalizedSubjects.filter(s => {
    const id = String(s.id).trim();
    const isBlocked = getSubjectStatus(s, userSubjects, subjects) === 'blocked';
    const isExcluded = excludedIds.has(id);
    
    // Log para debugging
    if (isBlocked && !isExcluded) {
      console.log(`Materia bloqueada: ${s.name}`, {
        id: s.id,
        correlativas: s.correlativas_cursado,
        isExcluded
      });
    }
    
    return isBlocked && !isExcluded;
  });

  const availableSubjects = normalizedSubjects.filter(s => {
    const id = String(s.id).trim();
    const isAvailable = getSubjectStatus(s, userSubjects, subjects) === 'available';
    const isExcluded = excludedIds.has(id);
    
    // Log para debugging
    if (isAvailable && !isExcluded) {
      console.log(`Materia disponible: ${s.name}`, {
        id: s.id,
        correlativas: s.correlativas_cursado,
        isExcluded
      });
    }
    
    return isAvailable && !isExcluded;
  });

  // Log de resultados
  console.log('Resultados del filtrado:', {
    total: normalizedSubjects.length,
    excluded: excludedIds.size,
    blocked: blockedSubjects.length,
    available: availableSubjects.length,
    blockedSubjects: blockedSubjects.map(s => s.name),
    availableSubjects: availableSubjects.map(s => s.name)
  });

  // Detectar materias "siguientes"
  const { maxYear, maxSemester } = getMaxYearAndSemester(userSubjects, normalizedSubjects);
  
  console.log('Año y semestre máximo:', { maxYear, maxSemester });

  const nextSubjects = availableSubjects.filter(s =>
    (s.year === maxYear && s.semester > maxSemester) ||
    (s.year === maxYear + 1 && s.semester === 1)
  );

  const nextBlockedSubjects = blockedSubjects.filter(s =>
    (s.year === maxYear && s.semester > maxSemester) ||
    (s.year === maxYear + 1 && s.semester === 1)
  );

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