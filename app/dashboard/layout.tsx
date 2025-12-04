import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ deviceId: string }>;
};

export default async function DashboardLayoutWrapper({ children }: Props) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
