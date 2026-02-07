jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { stock: 10 },
        error: null,
      }),
    })),
  },
}));

import { consultarStock } from "../lib/services/productoService";

test("Consultar stock de producto", async () => {
  const stock = await consultarStock(1);
  expect(stock).toBe(10);
});
