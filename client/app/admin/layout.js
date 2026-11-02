import ThemeToggle from "@/components/ui/ThemeToggle";

export const metadata = {
  title: "Admin | Riththika OS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      {children}
      <ThemeToggle floating />
    </>
  );
}