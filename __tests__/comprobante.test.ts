jest.mock("../lib/persistence/repositories/comprobanteRepository", () => ({
  crearComprobanteDb: jest.fn(),
  obtenerComprobantesDb: jest.fn(),
  obtenerComprobanteDb: jest.fn(),
  eliminarComprobanteDb: jest.fn(),
  actualizarComprobanteDb: jest.fn(),
}));

import {
  adjuntarComprobante,
  obtenerComprobantes,
  obtenerComprobante,
  actualizarComprobante,
  eliminarComprobante,
} from "../lib/services/comprobanteService";
import {
  crearComprobanteDb,
  obtenerComprobantesDb,
  obtenerComprobanteDb,
  eliminarComprobanteDb,
  actualizarComprobanteDb,
} from "../lib/persistence/repositories/comprobanteRepository";

beforeEach(() => {
  jest.clearAllMocks();
});

/* ===============================
   Adjuntar comprobante
   =============================== */
describe("Adjuntar comprobante", () => {
  test("Adjunta comprobante correctamente", async () => {
    const mockComprobante = {
      id_comprobante: 1,
      id_compra: 1,
      url_archivo: "https://storage.com/recibo.pdf",
      tipo: "PDF",
      descripcion: "Recibo de pago",
      fecha_subida: "2026-02-27T10:00:00",
    };
    (crearComprobanteDb as jest.Mock).mockResolvedValue(mockComprobante);

    const resultado = await adjuntarComprobante({
      id_compra: 1,
      url_archivo: "https://storage.com/recibo.pdf",
      tipo: "PDF",
      descripcion: "Recibo de pago",
    });

    expect(resultado.id_comprobante).toBe(1);
    expect(crearComprobanteDb).toHaveBeenCalled();
  });

  test("Error si falta ID de compra", async () => {
    await expect(
      adjuntarComprobante({
        id_compra: 0,
        url_archivo: "https://storage.com/recibo.pdf",
      })
    ).rejects.toThrow("ID de compra requerido");
  });

  test("Error si falta URL del archivo", async () => {
    await expect(
      adjuntarComprobante({
        id_compra: 1,
        url_archivo: "",
      })
    ).rejects.toThrow("URL del archivo es obligatoria");
  });
});

/* ===============================
   Obtener comprobantes de una compra
   =============================== */
describe("Obtener comprobantes", () => {
  test("Obtiene comprobantes de una compra", async () => {
    const mockComprobantes = [
      {
        id_comprobante: 1,
        url_archivo: "https://storage.com/recibo1.pdf",
        tipo: "PDF",
        fecha_subida: "2026-02-27T10:00:00",
      },
      {
        id_comprobante: 2,
        url_archivo: "https://storage.com/recibo2.pdf",
        tipo: "PDF",
        fecha_subida: "2026-02-27T11:00:00",
      },
    ];
    (obtenerComprobantesDb as jest.Mock).mockResolvedValue(mockComprobantes);

    const resultado = await obtenerComprobantes(1);

    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado.length).toBe(2);
  });

  test("Error si falta ID de compra", async () => {
    await expect(obtenerComprobantes(0)).rejects.toThrow("ID de compra requerido");
  });
});

/* ===============================
   Obtener comprobante por ID
   =============================== */
describe("Obtener comprobante por ID", () => {
  test("Obtiene comprobante correctamente", async () => {
    const mockComprobante = {
      id_comprobante: 1,
      id_compra: 1,
      url_archivo: "https://storage.com/recibo.pdf",
      tipo: "PDF",
      descripcion: "Recibo de pago",
      fecha_subida: "2026-02-27T10:00:00",
    };
    (obtenerComprobanteDb as jest.Mock).mockResolvedValue(mockComprobante);

    const resultado = await obtenerComprobante(1);

    expect(resultado.id_comprobante).toBe(1);
  });

  test("Error si falta ID de comprobante", async () => {
    await expect(obtenerComprobante(0)).rejects.toThrow(
      "ID de comprobante requerido"
    );
  });
});

/* ===============================
   Actualizar comprobante
   =============================== */
describe("Actualizar comprobante", () => {
  test("Actualiza comprobante correctamente", async () => {
    const mockActualizado = {
      id_comprobante: 1,
      tipo: "Factura",
      descripcion: "Factura actualizada",
    };
    (actualizarComprobanteDb as jest.Mock).mockResolvedValue(mockActualizado);

    const resultado = await actualizarComprobante(1, {
      tipo: "Factura",
      descripcion: "Factura actualizada",
    });

    expect(resultado.tipo).toBe("Factura");
  });

  test("Error si falta ID de comprobante", async () => {
    await expect(
      actualizarComprobante(0, { descripcion: "Test" })
    ).rejects.toThrow("ID de comprobante requerido");
  });
});

/* ===============================
   Eliminar comprobante
   =============================== */
describe("Eliminar comprobante", () => {
  test("Elimina comprobante correctamente", async () => {
    (eliminarComprobanteDb as jest.Mock).mockResolvedValue(true);

    const resultado = await eliminarComprobante(1);

    expect(resultado).toBe(true);
    expect(eliminarComprobanteDb).toHaveBeenCalledWith(1);
  });

  test("Error si falta ID de comprobante", async () => {
    await expect(eliminarComprobante(0)).rejects.toThrow(
      "ID de comprobante requerido"
    );
  });
});
