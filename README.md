# University Schedule

Una aplicación web para gestionar planes de estudio universitarios, desarrollada con Next.js, TypeScript, Tailwind CSS y Supabase.

## Características

- Autenticación de usuarios
- Gestión de planes de estudio
- Visualización de materias por carrera
- Seguimiento del progreso académico
- Interfaz responsiva y moderna

## Tecnologías

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Autenticación y Base de datos)
- Shadcn/ui (Componentes de UI)

## Requisitos

- Node.js 18 o superior
- npm o pnpm
- Cuenta de Supabase

## Configuración

1. Clona el repositorio:
```bash
git clone <URL-DEL-REPOSITORIO>
cd university-schedule
```

2. Instala las dependencias:
```bash
npm install
# o
pnpm install
```

3. Crea un archivo `.env.local` con las siguientes variables:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
pnpm dev
```

## Estructura del Proyecto

- `/app` - Rutas y páginas de la aplicación
- `/components` - Componentes reutilizables
- `/lib` - Utilidades y configuraciones
- `/public` - Archivos estáticos
- `/styles` - Estilos globales
- `/types` - Definiciones de tipos TypeScript

## Contribuir

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 