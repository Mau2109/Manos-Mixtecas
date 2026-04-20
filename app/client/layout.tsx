"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// ─── Carrito global (Context liviano via localStorage) ───────────────────────
import { CartProvider, useCart } from "../lib/context/_CardContext";

function Navbar() {
  const pathname = usePathname();
  const { itemCount, cliente, isAuthenticated, logoutClienteSession, authLoading } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/client", label: "Shop" },
    { href: "/client/catalogo", label: "Catálogo" },
    { href: "/client/artesano/1", label: "Artesanos" },
    { href: "/client/contacto", label: "Contacto" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FAF7F2] shadow-sm" : "bg-[#FAF7F2]"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/client" className="flex items-center">
          <img src="/assets/logo_manos_mixtecas.png" alt="Manos Mixtecas" className="h-16 w-auto object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm tracking-wide transition-colors ${
                pathname === href
                  ? "text-[#6B3A2A] border-b border-[#6B3A2A] pb-0.5 font-medium"
                  : "text-[#5C4A3A] hover:text-[#2C1810]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/client/carrito" className="relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="1.7">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#6B3A2A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/client/perfil" className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="1.7">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="hidden lg:block text-sm text-[#5C4A3A]">
              {authLoading ? "..." : isAuthenticated ? cliente?.nombre ?? "Mi perfil" : "Invitado"}
            </span>
          </Link>
          {!authLoading && !isAuthenticated && (
            <Link
              href="/client/login"
              className="hidden lg:block text-sm text-[#A08070] hover:text-[#6B3A2A] transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
          {isAuthenticated && (
            <button
              onClick={() => void logoutClienteSession()}
              className="hidden lg:block text-sm text-[#A08070] hover:text-[#6B3A2A] transition-colors"
            >
              Cerrar sesión
            </button>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="1.7">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-t border-[#E8DDD0] px-6 py-4 flex flex-col gap-4">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-sm text-[#5C4A3A] hover:text-[#2C1810]">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#2C1810] text-[#C8B8A8]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-[#F5EFE6] tracking-[0.2em] mb-6 uppercase">Manos Mixtecas</h2>
            <p className="text-sm leading-relaxed max-w-xs">
              Comprometidos con la preservación cultural y el desarrollo sostenible de las comunidades artesanas originarias de México.
            </p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[#A08070] mb-3">Navegación</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/client" className="hover:text-[#F5EFE6] transition-colors">Shop</Link>
              <Link href="/client/catalogo" className="hover:text-[#F5EFE6] transition-colors">Catálogo</Link>
              <Link href="/client/contacto" className="hover:text-[#F5EFE6] transition-colors">Contacto</Link>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[#A08070] mb-3">Legal</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#" className="hover:text-[#F5EFE6] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#F5EFE6] transition-colors">Shipping & Returns</Link>
              <Link href="#" className="hover:text-[#F5EFE6] transition-colors">Wholesale</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#4A2C1C] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#7A5A4A]">
          <p>© 2024 Manos Mixtecas. Preserving Oaxacan artistry.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#C8B8A8]">Instagram</a>
            <a href="#" className="hover:text-[#C8B8A8]">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#FAF7F2]">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
