import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin | Liron J",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 mr-64 p-8">{children}</main>
    </div>
  );
}
