import { supabase } from "@/lib/supabaseClient";

export async function signUpCliente(params: {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        nombre: params.nombre ?? "",
        apellido: params.apellido ?? "",
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInCliente(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutCliente() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function getSessionCliente() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChangeCliente(
  callback: (event: string, session: Awaited<ReturnType<typeof getSessionCliente>>) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
