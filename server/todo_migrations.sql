-- 1. Create Projects Table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text default 'indigo',
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Update Tasks Table (Enhance existing table)
alter table tasks 
add column if not exists title text, -- If description was used as title, we might migrate data
add column if not exists project_id uuid references projects(id) on delete set null,
add column if not exists due_date timestamp with time zone,
add column if not exists priority text default 'medium', -- low, medium, high
add column if not exists tags text[] default '{}',
add column if not exists notes text; -- Detailed description

-- 3. Create Subtasks Table
create table subtasks (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS (Row Level Security) - standard practice
alter table projects enable row level security;
alter table subtasks enable row level security;

create policy "Users can CRUD their own projects" on projects for all using (auth.uid() = user_id);
create policy "Users can CRUD their own subtasks" on subtasks for all using (
  exists (select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid())
);
