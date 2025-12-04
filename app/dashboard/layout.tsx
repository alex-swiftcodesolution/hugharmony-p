import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default async function DashboardLayoutWrapper({ children }: Props) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
