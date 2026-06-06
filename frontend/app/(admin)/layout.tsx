import AdminHeader from "@/app/_components/layout/admin/admin-header";
import AdminSidebar from "@/app/_components/layout/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="min-w-0 flex-1 p-4 lg:ml-72 lg:p-6">
          {children}
        </main>
      </div>
    </>
  );
}