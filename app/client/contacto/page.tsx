"use client";
import { useState, useEffect } from "react";
import { enviarMensajeContacto } from "@/lib/services/contactoService";
import { obtenerContactoYRedes } from "@/lib/services/empresaService";

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [empresa, setEmpresa] = useState<any>(null);

  useEffect(() => {
    obtenerContactoYRedes()
      .then(setEmpresa)
      .catch(() => { });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email inválido";
    if (!form.mensaje.trim() || form.mensaje.length < 10) e.mensaje = "Mínimo 10 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEnviar = async () => {
    if (!validate()) return;
    setEstado("enviando");
    setErrorMsg("");
    try {
      await enviarMensajeContacto(form);
      setEstado("enviado");
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch (error) {
      console.error("Error al enviar contacto:", error);
      setErrorMsg(error instanceof Error ? error.message : "Hubo un error al enviar. Por favor intenta de nuevo.");
      setEstado("error");
    }
  };

  const redes: Record<string, string> = empresa?.redes_sociales ?? {};

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-[#2C1810] mb-3">Contáctanos</h1>
        <p className="text-[#7A6A5A] max-w-md mx-auto">
          ¿Tienes preguntas sobre una pieza, un artesano o tu compra? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* ── Formulario USD18 ──────────────────────────────── */}
        <div>
          {estado === "enviado" ? (
            /* USD17 - Confirmación de envío */
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2C1810] mb-2">¡Mensaje enviado!</h3>
              <p className="text-[#7A6A5A] mb-6">
                Recibimos tu mensaje. Te responderemos en menos de 24 horas hábiles.
              </p>
              <button
                onClick={() => setEstado("idle")}
                className="text-sm text-[#6B3A2A] hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-7 shadow-sm">
              <h2 className="font-semibold text-[#2C1810] text-lg mb-6">Escríbenos</h2>
              <div className="space-y-4">
                {[
                  { key: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre" },
                  { key: "email", label: "Email", type: "email", placeholder: "tu@email.com" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label
                      htmlFor={`contacto-${key}`}
                      className="block text-xs font-medium text-[#5C4A3A] mb-1 uppercase tracking-wide"
                    >
                      {label}
                    </label>
                    <input
                      id={`contacto-${key}`}
                      type={type}
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none transition-colors placeholder:text-[#C4B8A8] text-[#2C1810] ${errors[key] ? "border-red-400" : "border-[#D4C4B0] focus:border-[#6B3A2A]"
                        }`}
                    />
                    {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                  </div>
                ))}
                <div>
                  <label
                    htmlFor="contacto-mensaje"
                    className="block text-xs font-medium text-[#5C4A3A] mb-1 uppercase tracking-wide"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="contacto-mensaje"
                    rows={5}
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.mensaje}
                    onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none resize-none transition-colors placeholder:text-[#C4B8A8] text-[#2C1810] ${errors.mensaje ? "border-red-400" : "border-[#D4C4B0] focus:border-[#6B3A2A]"
                      }`}
                  />
                  {errors.mensaje && <p className="text-xs text-red-500 mt-1">{errors.mensaje}</p>}
                </div>
              </div>

              {estado === "error" && (
                <p className="mt-3 text-sm text-red-500">
                  {errorMsg || "Hubo un error al enviar. Por favor intenta de nuevo."}
                </p>
              )}

              <button
                onClick={handleEnviar}
                disabled={estado === "enviando"}
                className="mt-6 w-full bg-[#2C1810] text-white py-3.5 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors disabled:opacity-50"
              >
                {estado === "enviando" ? "Enviando..." : "Enviar mensaje"}
              </button>
            </div>
          )}
        </div>

        {/* ── Redes y contacto USD19 ────────────────────────── */}
        <div className="space-y-5">
          {/* Datos de contacto */}
          <div className="bg-[#F0E8DC] rounded-2xl p-6">
            <h3 className="font-semibold text-[#2C1810] mb-5">Datos de contacto</h3>
            <div className="space-y-4">
              {empresa?.email && (
                <ContactItem icon="email" label="Email">
                  <a href={`mailto:${empresa.email}`} className="text-sm text-[#2C1810] hover:text-[#6B3A2A]">
                    {empresa.email}
                  </a>
                </ContactItem>
              )}
              {empresa?.formulario_contacto_email && !empresa?.email && (
                <ContactItem icon="email" label="Email">
                  <a href={`mailto:${empresa.formulario_contacto_email}`} className="text-sm text-[#2C1810] hover:text-[#6B3A2A]">
                    {empresa.formulario_contacto_email}
                  </a>
                </ContactItem>
              )}
              {empresa?.telefono && (
                <ContactItem icon="phone" label="Teléfono">
                  <a href={`tel:${empresa.telefono}`} className="text-sm text-[#2C1810] hover:text-[#6B3A2A]">
                    {empresa.telefono}
                  </a>
                </ContactItem>
              )}
              {empresa?.direccion && (
                <ContactItem icon="location" label="Dirección">
                  <p className="text-sm text-[#2C1810]">{empresa.direccion}</p>
                </ContactItem>
              )}
              {!empresa && (
                <>
                  <ContactItem icon="email" label="Email">
                    <span className="text-sm text-[#2C1810]">contacto@manosmixcecas.mx</span>
                  </ContactItem>
                  <ContactItem icon="location" label="Dirección">
                    <span className="text-sm text-[#2C1810]">Av. Doctor Modesto Seara Vázquez #1, Acatlima, 69000 Heroica Cdad. de Huajuapan de León, Oax.</span>
                  </ContactItem>
                </>
              )}
            </div>
          </div>

          {/* Ubicación USD28 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm overflow-hidden">
            <h3 className="font-semibold text-[#2C1810] mb-4">Ubicación</h3>
            <div className="rounded-xl overflow-hidden h-[250px] w-full border border-[#F0E8DC]">
              <iframe
                src="https://maps.google.com/maps?q=17.826653,-97.804444&hl=es&z=17&amp;output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#2C1810] mb-4">Síguenos en redes</h3>
            <div className="flex flex-wrap gap-3">
              {Object.keys(redes).length > 0 ? (
                Object.entries(redes).map(([red, url]) => (
                  <a
                    key={red}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-[#D4C4B0] rounded-full px-4 py-2 text-sm text-[#5C4A3A] hover:border-[#6B3A2A] hover:text-[#6B3A2A] transition-colors capitalize"
                  >
                    {red}
                  </a>
                ))
              ) : (
                ["Instagram", "Facebook", "WhatsApp"].map((red) => (
                  <a
                    key={red}
                    href="#"
                    className="flex items-center gap-2 border border-[#D4C4B0] rounded-full px-4 py-2 text-sm text-[#5C4A3A] hover:border-[#6B3A2A] hover:text-[#6B3A2A] transition-colors"
                  >
                    {red}
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Horario */}
          <div className="bg-[#2C1810] text-[#C8B8A8] rounded-2xl p-6">
            <h3 className="font-semibold text-[#F5EFE6] mb-4">Horario de atención</h3>
            <div className="space-y-2 text-sm">
              {[
                { dia: "Lunes – Viernes", hora: "9:00 – 18:00", activo: true },
                { dia: "Sábado", hora: "10:00 – 14:00", activo: true },
                { dia: "Domingo", hora: "Cerrado", activo: false },
              ].map(({ dia, hora, activo }) => (
                <div key={dia} className="flex justify-between">
                  <span>{dia}</span>
                  <span className={activo ? "text-[#F5EFE6]" : "text-[#6B5040]"}>{hora}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  const icons: Record<string, React.ReactNode> = {
    email: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B3A2A" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    phone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B3A2A" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 4h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 4 4l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 20 18" />
      </svg>
    ),
    location: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B3A2A" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
        {icons[icon]}
      </div>
      <div>
        <p className="text-xs text-[#A08070]">{label}</p>
        {children}
      </div>
    </div>
  );
}
