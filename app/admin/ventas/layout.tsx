import { VentasTopBar } from "@/components/ventasC/VentasTopBar";

export default function VentasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <VentasTopBar />
      <div className="flex-1 bg-muted/40">
        {children}
      </div>
    </div>
  );
}