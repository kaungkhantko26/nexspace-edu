import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default function DashboardPage() {
  return (
    <div>
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>
      <DashboardHome />
    </div>
  );
}

