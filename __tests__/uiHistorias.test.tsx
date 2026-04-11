/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

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

import Home from "../app/client/page";
import ContactoPage from "../app/client/contacto/page";

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
