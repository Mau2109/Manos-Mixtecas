import Link from "next/link"
import { Sparkles, Shield, Package, Users, BarChart3, ArrowRight } from "lucide-react"

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810]">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#F0E8DC_0%,#FAF7F2_60%)] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#2C1810] shadow-xl">
                <Sparkles className="w-10 h-10 text-[#D4B896]" />
              </div>
            </div>

            <span className="inline-flex items-center gap-2 bg-[#6B3A2A]/5 text-[#6B3A2A] text-[10px] font-bold tracking-[0.3em] px-4 py-2 rounded-full mb-8 uppercase">
              <Shield className="w-3 h-3" />
              Panel de Administración
            </span>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
              Sistema de Gestión <br />
              <span className="text-[#6B3A2A] italic">Manos Mixtecas</span>
            </h1>
            
            <p className="text-[#5C4A3A] text-lg leading-relaxed mb-12 max-w-xl mx-auto">
              Administra tu inventario, ventas, artesanos y más desde un solo lugar. 
              Accede con tus credenciales para comenzar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin/autenticacion/login"
                className="inline-flex items-center justify-center gap-3 bg-[#2C1810] text-white px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#6B3A2A] transition-all shadow-xl hover:shadow-[#6B3A2A]/20 hover:-translate-y-1"
              >
                Iniciar Sesión
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/client"
                className="inline-flex items-center justify-center gap-3 bg-white text-[#2C1810] px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#F0E8DC] transition-all shadow-lg border border-[#E6D8C7]"
              >
                Ver Tienda
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8B6A55] mb-4 block">
              Funcionalidades
            </span>
            <h2 className="text-4xl font-bold text-[#2C1810]">
              Todo lo que necesitas para gestionar tu negocio
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-[#FAF7F2] rounded-3xl border border-[#E6D8C7] hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#2C1810] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#6B3A2A] transition-colors">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2C1810]">Inventario</h3>
              <p className="text-[#5C4A3A] text-sm leading-relaxed">
                Gestiona tus productos, categorías y control de stock en tiempo real.
              </p>
            </div>

            <div className="group p-8 bg-[#FAF7F2] rounded-3xl border border-[#E6D8C7] hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#2C1810] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#6B3A2A] transition-colors">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2C1810]">Ventas</h3>
              <p className="text-[#5C4A3A] text-sm leading-relaxed">
                Registra ventas, genera tickets y consulta el historial de transacciones.
              </p>
            </div>

            <div className="group p-8 bg-[#FAF7F2] rounded-3xl border border-[#E6D8C7] hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#2C1810] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#6B3A2A] transition-colors">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2C1810]">Artesanos</h3>
              <p className="text-[#5C4A3A] text-sm leading-relaxed">
                Administra los perfiles de tus artesanos y proveedores.
              </p>
            </div>

            <div className="group p-8 bg-[#FAF7F2] rounded-3xl border border-[#E6D8C7] hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#2C1810] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#6B3A2A] transition-colors">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#2C1810]">Reportes</h3>
              <p className="text-[#5C4A3A] text-sm leading-relaxed">
                Visualiza estadísticas y reportes de tu negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#2C1810] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#D4B896]" />
            <span className="font-bold text-lg">Manos Mixtecas</span>
          </div>
          <p className="text-[#A08070] text-sm">
            Sistema de Gestión Empresarial - Panel de Administración
          </p>
        </div>
      </footer>
    </div>
  )
}
