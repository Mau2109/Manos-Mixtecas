import { aplicarDescuento } from "../lib/services/ventaService";
//Prueba de Aplicar Descuento


describe("Aplicar Descuento", () => {

  it("debe calcular descuento correctamente", () => {
    const resultado = aplicarDescuento(100, 10);
    expect(resultado).toBe(90);
  });

  it("debe lanzar error si el descuento es negativo", () => {
    expect(() => aplicarDescuento(100, -5))
      .toThrow("El descuento debe ser un valor positivo");
  });

  it("debe lanzar error si el descuento es cero", () => {
    expect(() => aplicarDescuento(100, 0))
      .toThrow("El descuento debe ser un valor positivo");
  });

});