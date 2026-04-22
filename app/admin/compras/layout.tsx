import { ComprasTopBar } from "@/components/comprasC/ComprasTopBar";

export default function ComprasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <ComprasTopBar />
      <div className="flex-1 bg-muted/40">
        {children}
      </div>
    </div>
  );
}