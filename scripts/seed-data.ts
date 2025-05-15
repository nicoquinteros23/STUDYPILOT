import { supabase } from "@/lib/supabase"

// Función para sembrar datos iniciales en la base de datos
export async function seedData() {
  try {
    // Crear universidad
    const { data: university, error: universityError } = await supabase
      .from("universities")
      .insert({
        name: "Universidad Tecnológica Nacional (UTN)",
        description: "Una de las principales universidades de ingeniería de Argentina.",
        logo: "/images/utn-logo.png",
      })
      .select()
      .single()

    if (universityError) throw universityError
    console.log("Universidad creada:", university)

    // Crear carrera
    const { data: career, error: careerError } = await supabase
      .from("careers")
      .insert({
        university_id: university.id,
        name: "Ingeniería en Sistemas de Información",
        description: "Forma profesionales capaces de analizar, diseñar, implementar y evaluar sistemas de información.",
        duration: "5 años",
      })
      .select()
      .single()

    if (careerError) throw careerError
    console.log("Carrera creada:", career)

    // Crear materias de primer año
    const firstYearSubjects = [
      {
        career_id: career.id,
        name: "Análisis Matemático I",
        year: "1",
        duration: "anual",
        description: "Cálculo diferencial e integral de una variable.",
        exam_board: "1",
      },
      {
        career_id: career.id,
        name: "Álgebra y Geometría Analítica",
        year: "1",
        duration: "anual",
        description: "Álgebra lineal y geometría analítica.",
        exam_board: "1",
      },
      {
        career_id: career.id,
        name: "Sistemas y Organizaciones",
        year: "1",
        duration: "cuatrimestral",
        semester: "primero",
        description: "Introducción a los sistemas de información y las organizaciones.",
        exam_board: "2",
      },
      {
        career_id: career.id,
        name: "Algoritmos y Estructuras de Datos",
        year: "1",
        duration: "anual",
        description: "Diseño de algoritmos y estructuras de datos fundamentales.",
        exam_board: "2",
      },
      {
        career_id: career.id,
        name: "Arquitectura de Computadoras",
        year: "1",
        duration: "anual",
        description: "Organización y arquitectura de computadoras.",
        exam_board: "3",
      },
    ]

    const { data: subjects, error: subjectsError } = await supabase.from("subjects").insert(firstYearSubjects).select()

    if (subjectsError) throw subjectsError
    console.log("Materias de primer año creadas:", subjects)

    // Crear materias de segundo año
    const secondYearSubjects = [
      {
        career_id: career.id,
        name: "Análisis Matemático II",
        year: "2",
        duration: "anual",
        description: "Cálculo diferencial e integral de varias variables.",
        exam_board: "1",
      },
      {
        career_id: career.id,
        name: "Probabilidad y Estadística",
        year: "2",
        duration: "anual",
        description: "Teoría de la probabilidad y estadística aplicada.",
        exam_board: "1",
      },
      {
        career_id: career.id,
        name: "Sistemas de Representación",
        year: "2",
        duration: "cuatrimestral",
        semester: "primero",
        description: "Técnicas de representación gráfica.",
        exam_board: "2",
      },
      {
        career_id: career.id,
        name: "Paradigmas de Programación",
        year: "2",
        duration: "anual",
        description: "Estudio de diferentes paradigmas de programación.",
        exam_board: "2",
      },
    ]

    const { data: secondYearSubjectsData, error: secondYearError } = await supabase
      .from("subjects")
      .insert(secondYearSubjects)
      .select()

    if (secondYearError) throw secondYearError
    console.log("Materias de segundo año creadas:", secondYearSubjectsData)

    // Establecer prerrequisitos
    // Primero, obtener todas las materias para tener sus IDs
    const { data: allSubjects, error: allSubjectsError } = await supabase.from("subjects").select("*")

    if (allSubjectsError) throw allSubjectsError

    // Función para encontrar el ID de una materia por su nombre
    const findSubjectIdByName = (name) => {
      const subject = allSubjects.find((s) => s.name === name)
      return subject ? subject.id : null
    }

    // Establecer prerrequisitos para Análisis Matemático II
    const amII = findSubjectIdByName("Análisis Matemático II")
    const amI = findSubjectIdByName("Análisis Matemático I")

    if (amII && amI) {
      await supabase.from("subject_prerequisites").insert({
        subject_id: amII,
        prerequisite_id: amI,
        type: "course",
      })

      await supabase.from("subject_prerequisites").insert({
        subject_id: amII,
        prerequisite_id: amI,
        type: "final",
      })
    }

    // Establecer prerrequisitos para Paradigmas de Programación
    const paradigmas = findSubjectIdByName("Paradigmas de Programación")
    const algoritmos = findSubjectIdByName("Algoritmos y Estructuras de Datos")

    if (paradigmas && algoritmos) {
      await supabase.from("subject_prerequisites").insert({
        subject_id: paradigmas,
        prerequisite_id: algoritmos,
        type: "course",
      })
    }

    console.log("Datos iniciales sembrados correctamente")
    return { success: true }
  } catch (error) {
    console.error("Error al sembrar datos iniciales:", error)
    return { success: false, error }
  }
}
