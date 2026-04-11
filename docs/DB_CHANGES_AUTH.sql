-- Add Supabase Auth linkage for clientes
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Ensure a client is uniquely mapped to an auth user
CREATE UNIQUE INDEX IF NOT EXISTS clientes_auth_user_id_unique
ON public.clientes(auth_user_id);

-- Optional: keep emails unique as already defined
