import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articulos, total, fecha, id_venta } = body;

    // 1. Crear el documento con una configuración ultra-básica
    const doc = new PDFDocument({
      size: [226, 450],
      margin: 10,
    });

    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(new Uint8Array(chunk)));

    const pdfBuffer = await new Promise<Uint8Array>((resolve, reject) => {
      doc.on("end", () => {
        const result = new Uint8Array(Buffer.concat(chunks.map(c => Buffer.from(c))));
        resolve(result);
      });
      doc.on("error", (err) => reject(err));

      // --- DISEÑO ---
      // IMPORTANTE: No llamamos a doc.font(). 
      // Dejamos que use la fuente por defecto (Courier) que es la más segura en servidores.
      
      doc.fontSize(12).text("MANOS MIXTECAS", { align: "center" });
      doc.fontSize(7).text("HUAJUAPAN DE LEON, OAXACA", { align: "center" });
      doc.moveDown();

      doc.fontSize(8).text(`TICKET: #V-${id_venta}`);
      doc.text(`FECHA: ${fecha}`);
      doc.text("------------------------------------------");

      if (articulos && Array.isArray(articulos)) {
        articulos.forEach((item: any) => {
          const y = doc.y;
          doc.text(`${item.cantidad}x ${item.nombre.substring(0, 12)}`, 10, y);
          doc.text(`$${(item.precio * item.cantidad).toFixed(2)}`, 160, y, { align: "right" });
          doc.moveDown(0.5);
        });
      }

      doc.text("------------------------------------------");
      doc.fontSize(10).text(`TOTAL: $${Number(total).toFixed(2)}`, { align: "right" });
      
      doc.moveDown(2);
      doc.fontSize(7).text("GRACIAS POR SU COMPRA", { align: "center" });
      
      doc.end();
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ticket-${id_venta}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("ERROR FINAL PDF:", error);
    return NextResponse.json(
      { error: `Error interno: ${error.message}` }, 
      { status: 500 }
    );
  }
}