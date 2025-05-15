-- Actualizar la tabla de materias
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS year INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS correlativas_cursado TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS correlativas_final TEXT[] DEFAULT '{}';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subjects_year ON subjects(year);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester);

-- Actualizar las políticas de seguridad
DROP POLICY IF EXISTS "Usuarios pueden ver materias" ON subjects;
DROP POLICY IF EXISTS "Admins pueden modificar materias" ON subjects;

CREATE POLICY "Usuarios pueden ver materias"
ON subjects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins pueden modificar materias"
ON subjects FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'is_admin' = 'true'
  )
); 