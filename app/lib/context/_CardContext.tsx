"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  actualizarCantidadProductoCarrito,
  agregarProductoCarrito,
  eliminarProductoCarritoPorProducto,
  obtenerCarrito,
  obtenerOCrearCarritoActivo,
  vaciarCarrito,
} from "@/lib/services/carritoService";
import {
  crearClienteTemporal,
  obtenerPerfilCliente,
  sincronizarClienteAuth,
} from "@/lib/services/clienteService";
import {
  getSessionCliente,
  onAuthStateChangeCliente,
  signOutCliente,
} from "@/lib/services/authClienteService";

const STORAGE_CART = "mm_carrito";
const STORAGE_CLIENTE_ID = "mm_cliente_id";
const STORAGE_CARRITO_ID = "mm_carrito_id";
const STORAGE_PERFIL = "mm_perfil";

export interface ClienteSession {
  id_cliente: number;
  auth_user_id?: string | null;
  nombre: string;
  apellido?: string | null;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
}

export interface CartItem {
  id_detalle?: number;
  id_producto: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen?: string;
  artesano?: string;
  stock?: number;
}

type CartActionResult = {
  ok: boolean;
  message?: string;
};

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  clienteId: number | null;
  carritoId: number | null;
  cliente: ClienteSession | null;
  isAuthenticated: boolean;
  authEmail: string | null;
  authUserId: string | null;
  authLoading: boolean;
  addItem: (item: CartItem) => Promise<CartActionResult>;
  removeItem: (id_producto: number) => Promise<CartActionResult>;
  updateQty: (id_producto: number, cantidad: number) => Promise<CartActionResult>;
  clearCart: () => Promise<void>;
  setClienteSession: (idCliente: number) => Promise<void>;
  logoutClienteSession: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

function parseStoredNumber(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [carritoId, setCarritoId] = useState<number | null>(null);
  const [cliente, setCliente] = useState<ClienteSession | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const persistLocalCart = (cartItems: CartItem[]) => {
    localStorage.setItem(STORAGE_CART, JSON.stringify(cartItems));
  };

  const guardarClienteId = (idCliente: number) => {
    localStorage.setItem(STORAGE_CLIENTE_ID, String(idCliente));
    setClienteId(idCliente);
  };

  const guardarCarritoId = (idCarrito: number) => {
    localStorage.setItem(STORAGE_CARRITO_ID, String(idCarrito));
    setCarritoId(idCarrito);
  };

  const guardarPerfilLocal = (perfil: ClienteSession | null) => {
    if (!perfil) {
      localStorage.removeItem(STORAGE_PERFIL);
      setCliente(null);
      return;
    }

    localStorage.setItem(STORAGE_PERFIL, JSON.stringify(perfil));
    setCliente(perfil);
  };

  const cargarItemsDesdeDb = async (idCarrito: number) => {
    const cartItems = await obtenerCarrito(idCarrito);
    setItems(cartItems);
    persistLocalCart(cartItems);
  };

  const migrarCarritoLocalASupabase = async (idCarrito: number) => {
    const local = localStorage.getItem(STORAGE_CART);
    if (!local) return;

    const itemsLocales = JSON.parse(local) as CartItem[];
    if (!Array.isArray(itemsLocales) || itemsLocales.length === 0) return;

    const itemsDb = await obtenerCarrito(idCarrito);
    if (itemsDb.length > 0) return;

    for (const item of itemsLocales) {
      await agregarProductoCarrito(
        idCarrito,
        item.id_producto,
        item.cantidad,
        item.precio_unitario
      );
    }
  };

  const ensureCliente = async () => {
    if (clienteId) return clienteId;

    const storedCliente = parseStoredNumber(localStorage.getItem(STORAGE_CLIENTE_ID));
    if (storedCliente) {
      setClienteId(storedCliente);
      return storedCliente;
    }

    const nuevoCliente = await crearClienteTemporal();
    guardarClienteId(nuevoCliente.id_cliente);
    return nuevoCliente.id_cliente as number;
  };

  const syncPerfilCliente = async (idCliente: number) => {
    try {
      const perfil = await obtenerPerfilCliente(idCliente);
      const esInvitadoTemporal = perfil.email.endsWith("@manosmixtecas.local");

      if (esInvitadoTemporal) {
        guardarPerfilLocal(null);
        return null;
      }

      const perfilNormalizado: ClienteSession = {
        id_cliente: perfil.id_cliente,
        auth_user_id: perfil.auth_user_id ?? null,
        nombre: perfil.nombre,
        apellido: perfil.apellido ?? null,
        email: perfil.email,
        telefono: perfil.telefono ?? null,
        direccion: perfil.direccion ?? null,
      };

      guardarPerfilLocal(perfilNormalizado);
      return perfilNormalizado;
    } catch (error) {
      console.error("No se pudo sincronizar el perfil del cliente", error);
      return null;
    }
  };

  const ensureCarrito = async (forcedClienteId?: number) => {
    if (carritoId) return carritoId;

    const storedCarrito = parseStoredNumber(localStorage.getItem(STORAGE_CARRITO_ID));
    if (storedCarrito) {
      setCarritoId(storedCarrito);
      return storedCarrito;
    }

    const resolvedClienteId = forcedClienteId ?? (await ensureCliente());
    const carrito = await obtenerOCrearCarritoActivo(resolvedClienteId);
    guardarCarritoId(carrito.id_carrito);
    await migrarCarritoLocalASupabase(carrito.id_carrito);
    return carrito.id_carrito as number;
  };

  const refreshCart = async () => {
    const idCliente = await ensureCliente();
    const idCarrito = await ensureCarrito(idCliente);
    await cargarItemsDesdeDb(idCarrito);
  };

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const local = localStorage.getItem(STORAGE_CART);
        if (local) {
          const parsed = JSON.parse(local) as CartItem[];
          if (active) setItems(parsed);
        }

        const storedCliente = parseStoredNumber(localStorage.getItem(STORAGE_CLIENTE_ID));
        if (storedCliente && active) {
          setClienteId(storedCliente);
        }

        const perfilLocal = localStorage.getItem(STORAGE_PERFIL);
        if (perfilLocal && active) {
          setCliente(JSON.parse(perfilLocal) as ClienteSession);
        }

        if (storedCliente) {
          const carrito = await obtenerOCrearCarritoActivo(storedCliente);
          if (!active) return;
          guardarCarritoId(carrito.id_carrito);
          await syncPerfilCliente(storedCliente);
          await cargarItemsDesdeDb(carrito.id_carrito);
        }

        const session = await getSessionCliente();
        if (!active) return;
        setAuthEmail(session?.user?.email ?? null);
        setAuthUserId(session?.user?.id ?? null);
        setAuthLoading(false);

        if (session?.user?.email) {
          const perfil = await sincronizarClienteAuth({
            auth_user_id: session.user.id,
            email: session.user.email,
            nombre: session.user.user_metadata?.nombre,
            apellido: session.user.user_metadata?.apellido,
          });
          const clienteSync = perfil.cliente as { id_cliente: number };
          await setClienteSession(clienteSync.id_cliente);
        }
      } catch (error) {
        console.error("No se pudo sincronizar el carrito con Supabase", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const { data } = onAuthStateChangeCliente(async (event, session) => {
      setAuthEmail(session?.user?.email ?? null);
      setAuthUserId(session?.user?.id ?? null);
      setAuthLoading(false);

      if (session?.user?.email) {
        const perfil = await sincronizarClienteAuth({
          auth_user_id: session.user.id,
          email: session.user.email,
          nombre: session.user.user_metadata?.nombre,
          apellido: session.user.user_metadata?.apellido,
        });
        const clienteSync = perfil.cliente as { id_cliente: number };
        await setClienteSession(clienteSync.id_cliente);
      } else if (event === "SIGNED_OUT") {
        limpiarSesionLocal();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const addItem = async (item: CartItem) => {
    const stockDisponible = Number(item.stock ?? Number.POSITIVE_INFINITY);
    const cantidadActual = items.find((i) => i.id_producto === item.id_producto)?.cantidad ?? 0;
    const cantidadFinal = cantidadActual + item.cantidad;

    if (cantidadFinal > stockDisponible) {
      return { ok: false, message: "No hay stock suficiente para agregar esa cantidad." };
    }

    try {
      const idCliente = await ensureCliente();
      const idCarrito = await ensureCarrito(idCliente);
      await agregarProductoCarrito(
        idCarrito,
        item.id_producto,
        item.cantidad,
        item.precio_unitario
      );
      await cargarItemsDesdeDb(idCarrito);
      return { ok: true, message: "Producto agregado al carrito" };
    } catch (error: any) {
      return { ok: false, message: error?.message ?? "No se pudo agregar el producto." };
    }
  };

  const removeItem = async (id_producto: number) => {
    try {
      const idCarrito = await ensureCarrito();
      await eliminarProductoCarritoPorProducto(idCarrito, id_producto);
      await cargarItemsDesdeDb(idCarrito);
      return { ok: true, message: "Producto eliminado" };
    } catch (error: any) {
      return { ok: false, message: error?.message ?? "No se pudo eliminar el producto." };
    }
  };

  const updateQty = async (id_producto: number, cantidad: number) => {
    const item = items.find((current) => current.id_producto === id_producto);
    const stockDisponible = Number(item?.stock ?? Number.POSITIVE_INFINITY);

    if (cantidad > stockDisponible) {
      return { ok: false, message: "No hay stock suficiente para esa cantidad." };
    }

    try {
      const idCarrito = await ensureCarrito();
      await actualizarCantidadProductoCarrito(idCarrito, id_producto, cantidad);
      await cargarItemsDesdeDb(idCarrito);
      return {
        ok: true,
        message: cantidad <= 0 ? "Producto eliminado" : "Cantidad actualizada",
      };
    } catch (error: any) {
      return { ok: false, message: error?.message ?? "No se pudo actualizar la cantidad." };
    }
  };

  const clearCart = async () => {
    if (!carritoId) {
      setItems([]);
      localStorage.removeItem(STORAGE_CART);
      return;
    }

    await vaciarCarrito(carritoId);
    setItems([]);
    localStorage.setItem(STORAGE_CART, JSON.stringify([]));
  };

  const setClienteSession = async (idCliente: number) => {
    guardarClienteId(idCliente);

    const carrito = await obtenerOCrearCarritoActivo(idCliente);
    guardarCarritoId(carrito.id_carrito);
    await syncPerfilCliente(idCliente);
    await cargarItemsDesdeDb(carrito.id_carrito);
  };

  const limpiarSesionLocal = () => {
    localStorage.removeItem(STORAGE_CLIENTE_ID);
    localStorage.removeItem(STORAGE_CARRITO_ID);
    localStorage.removeItem(STORAGE_CART);
    localStorage.removeItem(STORAGE_PERFIL);
    sessionStorage.removeItem("mm_checkout_envio");
    sessionStorage.removeItem("mm_checkout_pago");

    setClienteId(null);
    setCarritoId(null);
    setCliente(null);
    setItems([]);
  };

  const logoutClienteSession = async () => {
    try {
      await signOutCliente();
    } catch (error) {
      console.error("No se pudo cerrar sesion en Supabase", error);
    } finally {
      limpiarSesionLocal();
      setAuthEmail(null);
      setAuthUserId(null);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);
  const total = items.reduce(
    (sum, item) => sum + item.precio_unitario * item.cantidad,
    0
  );
  const isAuthenticated = Boolean(authEmail);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        clienteId,
        carritoId,
        cliente,
        isAuthenticated,
        authEmail,
        authUserId,
        authLoading,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        setClienteSession,
        logoutClienteSession,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
