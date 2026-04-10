jest.mock("../lib/persistence/repositories/ventaRepository", () => ({
  crearVentaDb: jest.fn(),
  confirmarPedidoDb: jest.fn(),
  obtenerResumenVentaDb: jest.fn(),
  obtenerEstadoEnvioDb: jest.fn(),
  agregarProductoVentaDb: jest.fn(),
  listarVentasDb: jest.fn(),
  cancelarVentaDb: jest.fn(),
  obtenerProductosVentaDb: jest.fn(),
  actualizarStockProductoDb: jest.fn(),
  restaurarStockProductoDb: jest.fn(),
  // add report helper so it can be mocked in tests later
  generarReporteVentasDb: jest.fn(),
  obtenerTopProductosDb: jest.fn(),
}));
  
  import {
    crearVenta,
    confirmarPedido,
    obtenerResumenCompra,
    obtenerResumenVenta,
    obtenerEstadoEnvio,
    agregarProductoVenta,
    listarVentas,
    confirmarYActualizarStock,
    cancelarVenta,
    generarReporteVentas,
    obtenerTopProductos,
    generarTicketVenta,
  } from "../lib/services/ventaService";
  import {
    confirmarPedidoDb,
    crearVentaDb,
    obtenerEstadoEnvioDb,
    obtenerResumenVentaDb,
    agregarProductoVentaDb,
    listarVentasDb,
    cancelarVentaDb,
    obtenerProductosVentaDb,
    actualizarStockProductoDb,
    restaurarStockProductoDb,
    generarReporteVentasDb,
    obtenerTopProductosDb,
  } from "../lib/persistence/repositories/ventaRepository";
  
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
      (crearVentaDb as jest.Mock).mockResolvedValue(mockVenta);
  
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
      ).rejects.toThrow("Total invalido");
    });
  
    test("Error si falta método de pago", async () => {
      await expect(
        crearVenta({ id_cliente: 1, total: 500, id_metodo_pago: 0, datos_envio: datosEnvioValidos })
      ).rejects.toThrow("Metodo de pago requerido");
    });
  
    test("Error si los datos de envío están incompletos", async () => {
      await expect(
        crearVenta({
          id_cliente: 1, total: 500, id_metodo_pago: 1,
          datos_envio: { nombre: "", apellido: "", direccion: "", ciudad: "", telefono: "" },
        })
      ).rejects.toThrow("Datos de envio incompletos");
    });
  });
  
  // ─── USD13 - Confirmar pedido ─────────────────────────────────────────────
  describe("USD13 - Confirmar pedido", () => {
    test("Confirma el pedido correctamente", async () => {
      const mockVenta = { id_venta: 1, confirmacion_pedido: true, estado: "Confirmado" };
      (confirmarPedidoDb as jest.Mock).mockResolvedValue(mockVenta);
  
      const venta = await confirmarPedido(1);
      expect(venta.confirmacion_pedido).toBe(true);
      expect(venta.estado).toBe("Confirmado");
    });
  
    test("Error si no se envía ID de venta", async () => {
      await expect(confirmarPedido(0)).rejects.toThrow("ID de venta requerido");
    });
  });
  
  // ─── Sin HU - Resumen de compra ───────────────────────────────────────────
  describe("Sin HU - Resumen de compra", () => {
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
      (obtenerResumenVentaDb as jest.Mock).mockResolvedValue(mockResumen);

      const resumen = await obtenerResumenVenta(1) as any;  // <-- cast aquí
        expect(resumen.total).toBe(500);
        expect(resumen.detalle_venta).toHaveLength(1);
        expect(resumen.metodos_pago.nombre).toBe("Transferencia");
      
    });
  
    test("Error si no se envía ID de venta", async () => {
      await expect(obtenerResumenVenta(0)).rejects.toThrow("ID de venta requerido");
    });
  });

  // ─── USD15 (UCD15) - Resumen de compra ───────────────────────────────────
  describe("USD15 - Resumen de compra", () => {
    test("Retorna resumen de compra antes de pago", async () => {
      const mockResumen = {
        id_venta: 99,
        total: 800,
        detalle_venta: [{ id_detalle: 1, cantidad: 2, precio_unitario: 400 }],
      };
      (obtenerResumenVentaDb as jest.Mock).mockResolvedValue(mockResumen);

      const resumen = await obtenerResumenCompra(99);
      expect(resumen.id_venta).toBe(99);
      expect(resumen.total).toBe(800);
      expect(resumen.detalle_venta).toHaveLength(1);
    });
  });
  
  // ─── USD17 - Estado de envío ──────────────────────────────────────────────
  describe("USD17 - Confirmación de envío", () => {
    test("Retorna el estado de envío del pedido", async () => {
      const mockEstado = {
        id_venta: 1,
        estado: "Enviado",
        confirmacion_envio: true,
        fecha_envio: "2025-01-15T10:00:00",
        datos_envio: datosEnvioValidos,
      };
      (obtenerEstadoEnvioDb as jest.Mock).mockResolvedValue(mockEstado);
  
      const estado = await obtenerEstadoEnvio(1);
      expect(estado.confirmacion_envio).toBe(true);
      expect(estado.estado).toBe("Enviado");
    });
  
    test("Error si no se envía ID de venta", async () => {
      await expect(obtenerEstadoEnvio(0)).rejects.toThrow("ID de venta requerido");
    });
  });

  // ─── Agregar producto a venta ──────────────────────────────────────────────
  describe("Agregar producto a venta", () => {
    test("Agregar producto correctamente", async () => {
      const mockDetalle = {
        id_detalle: 1,
        id_venta: 1,
        id_producto: 1,
        cantidad: 2,
        precio_unitario: 250,
      };
      (agregarProductoVentaDb as jest.Mock).mockResolvedValue(mockDetalle);

      const detalle = await agregarProductoVenta({
        id_venta: 1,
        id_producto: 1,
        cantidad: 2,
        precio_unitario: 250,
      });

      expect(detalle.cantidad).toBe(2);
      expect(detalle.id_producto).toBe(1);
    });

    test("Error si cantidad es inválida", async () => {
      await expect(
        agregarProductoVenta({
          id_venta: 1,
          id_producto: 1,
          cantidad: 0,
          precio_unitario: 250,
        })
      ).rejects.toThrow("Cantidad debe ser mayor a 0");
    });

    test("Error si precio es inválido", async () => {
      await expect(
        agregarProductoVenta({
          id_venta: 1,
          id_producto: 1,
          cantidad: 2,
          precio_unitario: 0,
        })
      ).rejects.toThrow("Precio unitario debe ser mayor a 0");
    });
  });

  // ─── Listar ventas ──────────────────────────────────────────────────────────
  describe("Listar ventas", () => {
    test("Listar todas las ventas", async () => {
      const mockVentas = [
        { id_venta: 1, total: 500, estado: "Pendiente" },
        { id_venta: 2, total: 300, estado: "Confirmado" },
      ];
      (listarVentasDb as jest.Mock).mockResolvedValue(mockVentas);

      const ventas = await listarVentas();

      expect(Array.isArray(ventas)).toBe(true);
      expect(ventas.length).toBe(2);
    });

    test("Listar ventas por estado", async () => {
      const mockVentas = [{ id_venta: 1, total: 500, estado: "Pendiente" }];
      (listarVentasDb as jest.Mock).mockResolvedValue(mockVentas);

      const ventas = await listarVentas({ estado: "Pendiente" });

      expect(Array.isArray(ventas)).toBe(true);
    });

    test("Listar ventas por rango de fechas", async () => {
      const mockVentas = [
        { id_venta: 1, total: 500, estado: "Confirmado", fecha_venta: "2025-02-15" },
      ];
      (listarVentasDb as jest.Mock).mockResolvedValue(mockVentas);

      const ventas = await listarVentas({
        fechaInicio: "2025-02-01",
        fechaFin: "2025-02-28",
      });

      expect(Array.isArray(ventas)).toBe(true);
      expect(listarVentasDb).toHaveBeenCalledWith({
        fechaInicio: "2025-02-01",
        fechaFin: "2025-02-28",
      });
    });

    test("Listar ventas con múltiples filtros", async () => {
      const mockVentas = [{ id_venta: 1, total: 500, estado: "Confirmado" }];
      (listarVentasDb as jest.Mock).mockResolvedValue(mockVentas);

      const ventas = await listarVentas({
        estado: "Confirmado",
        fechaInicio: "2025-02-01",
        fechaFin: "2025-02-28",
      });

      expect(Array.isArray(ventas)).toBe(true);
    });
  });

  // ─── Confirmar venta y actualizar stock ────────────────────────────────────
  describe("Confirmar venta y actualizar stock", () => {
    test("Confirmar venta correctamente", async () => {
      const mockProductos = [
        { id_detalle: 1, id_producto: 1, cantidad: 2, precio_unitario: 250 },
      ];
      const mockVentaConfirmada = {
        id_venta: 1,
        estado: "Confirmado",
        confirmacion_pedido: true,
      };

      (obtenerProductosVentaDb as jest.Mock).mockResolvedValue(mockProductos);
      (actualizarStockProductoDb as jest.Mock).mockResolvedValue({});
      (confirmarPedidoDb as jest.Mock).mockResolvedValue(mockVentaConfirmada);

      const venta = await confirmarYActualizarStock(1);

      expect(venta.estado).toBe("Confirmado");
      expect(actualizarStockProductoDb).toHaveBeenCalledWith(1, 2);
    });

    test("Error si no tiene productos", async () => {
      (obtenerProductosVentaDb as jest.Mock).mockResolvedValue([]);

      await expect(confirmarYActualizarStock(1)).rejects.toThrow(
        "La venta no tiene productos para confirmar"
      );
    });
  });

  // ─── Cancelar venta ────────────────────────────────────────────────────────
  describe("Cancelar venta", () => {
    test("Cancelar venta correctamente", async () => {
      const mockProductos = [
        { id_detalle: 1, id_producto: 1, cantidad: 2, precio_unitario: 250 },
      ];
      const mockVentaCancelada = {
        id_venta: 1,
        estado: "Cancelado",
      };

      (obtenerProductosVentaDb as jest.Mock).mockResolvedValue(mockProductos);
      (restaurarStockProductoDb as jest.Mock).mockResolvedValue({});
      (cancelarVentaDb as jest.Mock).mockResolvedValue(mockVentaCancelada);

      const venta = await cancelarVenta(1);

      expect(venta.estado).toBe("Cancelado");
      expect(restaurarStockProductoDb).toHaveBeenCalledWith(1, 2);
    });

    test("Error si no se envía ID", async () => {
      await expect(cancelarVenta(0)).rejects.toThrow("ID de venta requerido");
    });
  });

  // ─── Generar reporte de ventas ──────────────────────────────────────────────
  describe("Generar reporte de ventas", () => {
    test("Reporte básico sin filtros", async () => {
      const mockReporte = {
        ventas: [
          { id_venta: 1, total: 100 },
          { id_venta: 2, total: 200 },
        ],
        resumen: { totalIngresos: 300, cantidad: 2 },
      };
      const { generarReporteVentasDb } = require("../lib/persistence/repositories/ventaRepository");
      generarReporteVentasDb.mockResolvedValue(mockReporte);

      const rpt = await generarReporteVentas();
      expect(rpt.resumen.totalIngresos).toBe(300);
      expect(rpt.ventas.length).toBe(2);
    });

    test("Reporte con rango de fechas", async () => {
      const mockReporte = {
        ventas: [{ id_venta: 3, total: 150 }],
        resumen: { totalIngresos: 150, cantidad: 1 },
      };
      const { generarReporteVentasDb } = require("../lib/persistence/repositories/ventaRepository");
      generarReporteVentasDb.mockResolvedValue(mockReporte);

      const rpt = await generarReporteVentas({
        fechaInicio: "2025-01-01",
        fechaFin: "2025-12-31",
      });
      expect(rpt.resumen.cantidad).toBe(1);
      expect(generarReporteVentasDb).toHaveBeenCalledWith({
        fechaInicio: "2025-01-01",
        fechaFin: "2025-12-31",
      });
    });

    // ─── Top sellers report ─────────────────────────────────────────────
    describe("Reporte top productos", () => {
      test("Obtiene top 5 productos por cantidad vendida", async () => {
        const mockTop = [
          { id_producto: 1, nombre: "Producto A", total_vendido: 10 },
          { id_producto: 2, nombre: "Producto B", total_vendido: 8 },
        ];
        const { obtenerTopProductosDb } = require("../lib/persistence/repositories/ventaRepository");
        obtenerTopProductosDb.mockResolvedValue(mockTop);

        const resultado = await obtenerTopProductos();
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado[0].total_vendido).toBe(10);
        expect(obtenerTopProductosDb).toHaveBeenCalled();
      });
    });
  });

  // ─── Reporte top products ────────────────────────────────────────────
  describe("Top 5 productos más vendidos", () => {
    test("Devuelve ranking de productos", async () => {
      const mockTop = [
        { id_producto: 1, nombre: "Alhaja", total_vendido: 10 },
        { id_producto: 2, nombre: "Cestería", total_vendido: 8 },
      ];
      (require("../lib/persistence/repositories/ventaRepository").obtenerTopProductosDb as jest.Mock).mockResolvedValue(mockTop);

      const resultado = await obtenerTopProductos();
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado[0].total_vendido).toBe(10);
    });
  });

  // ─── Generar ticket de venta en PDF ────────────────────────────────────
  describe("Generar ticket de venta en PDF", () => {
    test("Genera buffer con contenido y encabezado PDF", async () => {
      const mockResumen = {
        id_venta: 1,
        total: 123.45,
        clientes: { nombre: "Ana", apellido: "López" },
      };
      (require("../lib/persistence/repositories/ventaRepository").obtenerResumenVentaDb as jest.Mock).mockResolvedValue(mockResumen);

      const ticket = await generarTicketVenta(1);
      expect(ticket).toBeInstanceOf(Buffer);
      const texto = ticket.toString("utf-8");
      expect(texto).toContain("%PDF-1.4");
      expect(texto).toContain("Venta #1");
      expect(texto).toContain("Total: 123.45");
    });

    test("Error si falta ID de venta", async () => {
      await expect(generarTicketVenta(0)).rejects.toThrow("ID de venta requerido");
    });
  });
