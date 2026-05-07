import { Sidebar } from "@/components/dashboard/sidebar";
import { ProductivityPage } from "@/components/productivity/productivity-page";

export default function ReportsPage() {
  return (
    <div>
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>
      <ProductivityPage kind="reports" />
    </div>
  );
}
