import { supabase } from "../../lib/supabaseClient";

describe("Prueba de integración con Supabase", () => {

  test("Conexión real: insertar y consultar cliente", async () => {
    // 1. Insertar cliente
    const { data: clienteInsertado, error: insertError } = await supabase
      .from("clientes")
      .insert({
        nombre: "ClienteTest",
        email: `test_${Date.now()}@mail.com`,
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(clienteInsertado).toBeDefined();

    // 2. Consultar cliente
    const { data: clienteConsultado, error: selectError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id_cliente", clienteInsertado.id_cliente)
      .single();

    expect(selectError).toBeNull();
    expect(clienteConsultado.email).toBe(clienteInsertado.email);

    // 3. Limpieza (delete)
    await supabase
      .from("clientes")
      .delete()
      .eq("id_cliente", clienteInsertado.id_cliente);
  });

});