import { AppHeader } from "@/components/layout/AppHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
