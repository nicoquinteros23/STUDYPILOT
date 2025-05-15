-- Eliminar políticas existentes
drop policy if exists "Permitir lectura de materias a todos los usuarios" on subjects;
drop policy if exists "Permitir inserción de materias a administradores" on subjects;
drop policy if exists "Permitir actualización de materias a administradores" on subjects;
drop policy if exists "Permitir eliminación de materias a administradores" on subjects;
drop policy if exists "Permitir a los usuarios ver sus propios planes de estudio" on study_plans;
drop policy if exists "Permitir a los usuarios crear sus propios planes de estudio" on study_plans;
drop policy if exists "Permitir a los usuarios actualizar sus propios planes de estudio" on study_plans;
drop policy if exists "Permitir a los usuarios eliminar sus propios planes de estudio" on study_plans;

-- Crear la tabla de materias
create table if not exists subjects (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name text not null,
  year integer not null check (year between 1 and 5),
  semester integer not null check (semester between 0 and 2),
  credits integer not null default 0,
  correlativas_cursado text[] default '{}',
  correlativas_final text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear la tabla de materias del usuario
create table if not exists user_subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'failed')),
  grade numeric check (grade between 0 and 10),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, subject_id)
);

-- Habilitar RLS
alter table subjects enable row level security;
alter table user_subjects enable row level security;

-- Políticas para subjects (lectura pública, escritura solo admin)
create policy "Permitir lectura de materias a todos los usuarios"
  on subjects for select
  to authenticated
  using (true);

create policy "Permitir inserción de materias a administradores"
  on subjects for insert
  to authenticated
  with check (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

create policy "Permitir actualización de materias a administradores"
  on subjects for update
  to authenticated
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

create policy "Permitir eliminación de materias a administradores"
  on subjects for delete
  to authenticated
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Políticas para user_subjects (cada usuario solo ve y modifica sus propios registros)
create policy "Permitir a los usuarios ver sus propias materias"
  on user_subjects for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Permitir a los usuarios crear sus propias materias"
  on user_subjects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Permitir a los usuarios actualizar sus propias materias"
  on user_subjects for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Permitir a los usuarios eliminar sus propias materias"
  on user_subjects for delete
  to authenticated
  using (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
create index if not exists subjects_code_idx on subjects(code);
create index if not exists user_subjects_user_id_idx on user_subjects(user_id);
create index if not exists user_subjects_subject_id_idx on user_subjects(subject_id); 