import AdminGuard from "@/components/admin/AdminGuard";
import ToastProvider from "@/components/admin/ToastProvider";
import AdminShell from "@/components/admin/AdminShell";

export default function ProtectedAdminLayout({ children }) {
  return (
    <AdminGuard>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </AdminGuard>
  );
}