// app/dashboard/[deviceId]/layout.tsx

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ deviceId: string }>;
}

export default async function Dashboard({ children }: LayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
