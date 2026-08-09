import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SidebarProvider } from "@/contexts/SidebarContext";

export const metadata: Metadata = {
  title: { default: "HappyPaws Admin", template: "%s | HappyPaws Admin" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#09090b] relative font-sans text-foreground selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Subtle ambient lighting backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent z-0" />
        
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

