jest.mock("../lib/supabaseClient", () => ({
    supabase: {
      from: jest.fn(),
    },
  }));
  
  import {
    crearVenta,
    confirmarPedido,
    obtenerResumenVenta,
    obtenerEstadoEnvio,
  } from "../lib/services/ventaService";
  import { supabase } from "../lib/supabaseClient";
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const datosEnvioValidos = {
    nombre: "Ana",
    apellido: "López",
    direccion: "Calle Reforma 100",
    ciudad: "Oaxaca",
    telefono: "9510000001",
  };
  
  // ─── USD13 / USD14 - Crear venta ──────────────────────────────────────────
  describe("USD13/14 - Crear venta con datos de envío", () => {
    test("Crea venta correctamente con todos los datos", async () => {
      const mockVenta = { id_venta: 1, total: 500, estado: "Pendiente" };
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockVenta, error: null }),
      });
  
      const venta = await crearVenta({
        id_cliente: 1,
        total: 500,
        id_metodo_pago: 1,
        datos_envio: datosEnvioValidos,
      });
      expect(venta.id_venta).toBe(1);
      expect(venta.estado).toBe("Pendiente");
    });
  
    test("Error si falta ID de cliente", async () => {
      await expect(
        crearVenta({ id_cliente: 0, total: 500, id_metodo_pago: 1, datos_envio: datosEnvioValidos })
      ).rejects.toThrow("ID de cliente requerido");
    });
  
    test("Error si el total es inválido", async () => {
      await expect(
        crearVenta({ id_cliente: 1, total: 0, id_metodo_pago: 1, datos_envio: datosEnvioValidos })
      ).rejects.toThrow("Total inválido");
    });
  
    test("Error si falta método de pago", async () => {
      await expect(
        crearVenta({ id_cliente: 1, total: 500, id_metodo_pago: 0, datos_envio: datosEnvioValidos })
      ).rejects.toThrow("Método de pago requerido");
    });
  
    test("Error si los datos de envío están incompletos", async () => {
      await expect(
        crearVenta({
          id_cliente: 1, total: 500, id_metodo_pago: 1,
          datos_envio: { nombre: "", apellido: "", direccion: "", ciudad: "", telefono: "" },
        })
      ).rejects.toThrow("Datos de envío incompletos");
    });
  });
  
  // ─── USD13 - Confirmar pedido ─────────────────────────────────────────────
  describe("USD13 - Confirmar pedido", () => {
    test("Confirma el pedido correctamente", async () => {
      const mockVenta = { id_venta: 1, confirmacion_pedido: true, estado: "Confirmado" };
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockVenta, error: null }),
      });
  
      const venta = await confirmarPedido(1);
      expect(venta.confirmacion_pedido).toBe(true);
      expect(venta.estado).toBe("Confirmado");
    });
  
    test("Error si no se envía ID de venta", async () => {
      await expect(confirmarPedido(0)).rejects.toThrow("ID de venta requerido");
    });
  });
  
  // ─── USD15 - Resumen de compra ────────────────────────────────────────────
  describe("USD15 - Resumen de compra", () => {
    test("Retorna venta completa con detalles, cliente y método de pago", async () => {
        const mockResumen = {
            id_venta: 1,
            total: 500,
            subtotal: 500,
            descuento_pct: 0,
            estado: "Pendiente",
            datos_envio: datosEnvioValidos,
            metodos_pago: { nombre: "Transferencia" },   // Supabase lo infiere como array
            clientes: { nombre: "Ana", apellido: "López" },
            detalle_venta: [{ id_detalle: 1, cantidad: 2, precio_unitario: 250 }],
          } as any;  
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResumen, error: null }),
      });

      const resumen = await obtenerResumenVenta(1) as any;  // <-- cast aquí
        expect(resumen.total).toBe(500);
        expect(resumen.detalle_venta).toHaveLength(1);
        expect(resumen.metodos_pago.nombre).toBe("Transferencia");
      
    });
  
    test("Error si no se envía ID de venta", async () => {
      await expect(obtenerResumenVenta(0)).rejects.toThrow("ID de venta requerido");
    });
  });
  
  // ─── USD18 - Estado de envío ──────────────────────────────────────────────
  describe("USD18 - Confirmación de envío", () => {
    test("Retorna el estado de envío del pedido", async () => {
      const mockEstado = {
        id_venta: 1,
        estado: "Enviado",
        confirmacion_envio: true,
        fecha_envio: "2025-01-15T10:00:00",
        datos_envio: datosEnvioValidos,
      };
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockEstado, error: null }),
      });
  
      const estado = await obtenerEstadoEnvio(1);
      expect(estado.confirmacion_envio).toBe(true);
      expect(estado.estado).toBe("Enviado");
    });
  
    test("Error si no se envía ID de venta", async () => {
      await expect(obtenerEstadoEnvio(0)).rejects.toThrow("ID de venta requerido");
    });
  });