import html2canvas from "html2canvas"

export const exportAsImage = async (element: HTMLElement, filename = "horario"): Promise<void> => {
  try {
    // Crear una copia del elemento para no modificar el original
    const clonedElement = element.cloneNode(true) as HTMLElement

    // Crear un contenedor temporal fuera de la vista
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.top = "-9999px"
    container.style.width = "1000px" // Ancho fijo para mejor calidad
    container.style.backgroundColor = "white"
    container.style.padding = "20px"

    // Aplicar estilos para mejorar la apariencia
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      * {
        font-family: Arial, sans-serif;
        box-sizing: border-box;
      }
      .grid {
        display: table;
        width: 100%;
        border-collapse: collapse;
      }
      .grid-cols-7 > div {
        display: table-cell;
        border: 1px solid #ccc;
        padding: 4px;
        vertical-align: top;
        width: 14.28%;
      }
      .h-12 {
        height: 40px;
      }
      .font-semibold {
        font-weight: 600;
      }
      .text-sm {
        font-size: 12px;
      }
      .text-xs {
        font-size: 10px;
      }
      .bg-muted {
        background-color: #f5f5f5;
      }
      .rounded {
        border-radius: 4px;
      }
      .p-1 {
        padding: 4px;
      }
      .mb-1 {
        margin-bottom: 4px;
      }
      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `

    // Añadir título
    const titleElement = document.createElement("h1")
    titleElement.textContent = "Horario Académico"
    titleElement.style.textAlign = "center"
    titleElement.style.marginBottom = "20px"
    titleElement.style.fontFamily = "Arial, sans-serif"

    container.appendChild(styleElement)
    container.appendChild(titleElement)
    container.appendChild(clonedElement)
    document.body.appendChild(container)

    // Capturar la imagen del contenedor
    const canvas = await html2canvas(container, {
      scale: 2, // Mayor escala para mejor calidad
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    // Crear un enlace para descargar la imagen
    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()

    // Limpiar el DOM
    document.body.removeChild(container)
  } catch (error) {
    console.error("Error al exportar imagen:", error)
    throw error
  }
}
