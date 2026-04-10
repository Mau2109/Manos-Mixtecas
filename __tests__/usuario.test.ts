jest.mock("../lib/persistence/repositories/usuarioRepository", () => ({
    getUsuarios: jest.fn(),
    deleteUsuario: jest.fn(),
    getVendedorAccess: jest.fn(),
}));

import {
    listarUsuarios,
    eliminarUsuario,
    obtenerAccesoVendedor
} from "../lib/services/usuarioService";
 
import {
    getUsuarios,
    deleteUsuario,
    getVendedorAccess
} from "../lib/persistence/repositories/usuarioRepository";

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── AMD10 - Consultar lista de usuarios ─────────────────────────────
describe("AMD10 - Consultar lista de usuarios", () => {
    test("Retorna lista de usuarios con nombre, email y rol", async () => {
        const mockUsuarios = [
            { nombre: "Juan", email: "juan@example.com", rol: "administrador" },
            { nombre: "María", email: "maria@example.com", rol: "vendedor" },
        ];
        (getUsuarios as jest.Mock).mockResolvedValue(mockUsuarios);
        const result = await listarUsuarios();
        expect(result).toEqual(mockUsuarios);
    });
    test("Retorna lista vacía cuando no hay usuarios", async () => {
        (getUsuarios as jest.Mock).mockResolvedValue([]);
        const result = await listarUsuarios();
        expect(result).toEqual([]);
    });

    test("Maneja errores al consultar usuarios", async () => {
        (getUsuarios as jest.Mock).mockRejectedValue(new Error("Error de conexión"));
        await expect(listarUsuarios()).rejects.toThrow("Error de conexión");
    });
});

// ─── AMD11 - Eliminar usuario ─────────────────────────────────────────
describe("AMD11 - Eliminar usuario", () => {
    test("Elimina un usuario exitosamente", async () => {
        (deleteUsuario as jest.Mock).mockResolvedValue(true);
        const result = await eliminarUsuario("user123");
        expect(deleteUsuario).toHaveBeenCalledWith("user123");
        expect(result).toBe(true);
    });

    test("Retorna error al intentar eliminar usuario inexistente", async () => {
        (deleteUsuario as jest.Mock).mockRejectedValue(new Error("Usuario no encontrado"));
        await expect(eliminarUsuario("user999")).rejects.toThrow("Usuario no encontrado");
    });
});

// ─── AMD16 - Obtener acceso limitado para vendedores ────────────────
describe("AMD12 - Obtener acceso limitado para vendedores", () => {
    test("Retorna interfaz limitada para vendedor", async () => {
        (getUsuarios as jest.Mock).mockResolvedValue([
            { nombre: "vendedor123", rol: "vendedor" }
        ]);

        const mockAcceso = {
            ventas: true,
            inventario: true,
            otros: false
        };
        
        (getVendedorAccess as jest.Mock).mockResolvedValue(mockAcceso);

        const result = await obtenerAccesoVendedor("vendedor123");

        expect(getVendedorAccess).toHaveBeenCalledWith("vendedor123");
        expect(result).toEqual(mockAcceso); 
        expect(result).toHaveProperty('ventas', true);
    });
});