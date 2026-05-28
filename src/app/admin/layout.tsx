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
      <main className="flex-1 pt-[56px] lg:pt-0 lg:mr-64 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
