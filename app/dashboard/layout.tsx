import { Header } from "@/components/layout/header";

// Mock user - in production, this would come from your auth system
const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={mockUser} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
