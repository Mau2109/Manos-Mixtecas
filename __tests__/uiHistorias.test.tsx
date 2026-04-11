/** @jest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

const mockPush = jest.fn();

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/admin",
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

import Home from "../app/client/page";
import ContactoPage from "../app/client/contacto/page";
import LoginPage from "../app/admin/autenticacion/login/page";
import ComprasOpcionesModuloPage from "../app/admin/compras/opciones_modulo/page";
import VentasOpcionesModuloPage from "../app/admin/ventas/opciones_modulov/page";

beforeEach(() => {
  mockPush.mockClear();
});

describe("USD10 - Diseño acceso a catalogo", () => {
  test("Muestra acceso al catálogo desde la página de inicio", async () => {
    const home = await Home();
    render(home);
    const link = screen.getByRole("link", { name: /explorar colección/i });
    expect(link).toHaveAttribute("href", "/client/catalogo");
  });
});

describe("USD18 - Formulario de contacto", () => {
  test("Muestra campos para nombre, email y mensaje", () => {
    render(<ContactoPage />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });
});

describe("ADM01 - Inicio de sesión administrador", () => {
  test("Muestra formulario de inicio de sesión", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /entrar al panel/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });
});

describe("ADM12 - Registrar compra", () => {
  test("Permite navegar al formulario para registrar compra", () => {
    render(<ComprasOpcionesModuloPage />);
    fireEvent.click(screen.getByText(/registrar compra/i));

    expect(mockPush).toHaveBeenCalledWith("/admin/compras/registrar_compra");
  });
});

describe("ADM13 - Registrar método de pago", () => {
  test("Permite navegar al formulario para registrar método de pago", () => {
    render(<ComprasOpcionesModuloPage />);
    fireEvent.click(screen.getByText(/registrar método de pago/i));

    expect(mockPush).toHaveBeenCalledWith("/admin/compras/registrar_metodo_pago");
  });
});

describe("ADM14 - Registrar venta", () => {
  test("Permite navegar al formulario para registrar venta", () => {
    render(<VentasOpcionesModuloPage />);
    fireEvent.click(screen.getByText(/registrar venta/i));

    expect(mockPush).toHaveBeenCalledWith("/admin/ventas/registrar_venta");
  });
});

describe("ADM15 - Consultar ventas", () => {
  test("Permite navegar al historial para consultar ventas", () => {
    render(<VentasOpcionesModuloPage />);
    fireEvent.click(screen.getByText(/consultar ventas/i));

    expect(mockPush).toHaveBeenCalledWith("/admin/ventas/consultar_ventas");
  });
});
