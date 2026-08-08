import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: { default: "HappyPaws Admin", template: "%s | HappyPaws Admin" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-[#09090b]">{children}</main>
      </div>
    </div>
  );
}
