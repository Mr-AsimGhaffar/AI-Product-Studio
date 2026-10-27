CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS projects (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  product    text NOT NULL,
  colors     text[] NOT NULL DEFAULT '{}',
  platform   text NOT NULL DEFAULT 'Amazon',
  brief      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  angle      text,
  prompt     text,
  model      text,
  media_type text NOT NULL,
  data       bytea NOT NULL,
  size_bytes integer NOT NULL,
  details    jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS images_project_id_idx ON images (project_id, created_at);
