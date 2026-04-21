-- USD17/18/19 - Tabla para mensajes de contacto
CREATE TABLE IF NOT EXISTS public.mensajes_contacto (
  id_mensaje integer NOT NULL DEFAULT nextval('mensajes_contacto_id_seq'::regclass),
  nombre character varying NOT NULL,
  email character varying NOT NULL,
  mensaje text NOT NULL,
  fecha_envio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  estado character varying DEFAULT 'nuevo'::character varying,
  CONSTRAINT mensajes_contacto_pkey PRIMARY KEY (id_mensaje)
);

CREATE INDEX IF NOT EXISTS mensajes_contacto_email_idx
  ON public.mensajes_contacto (email);

CREATE INDEX IF NOT EXISTS mensajes_contacto_fecha_idx
  ON public.mensajes_contacto (fecha_envio);
