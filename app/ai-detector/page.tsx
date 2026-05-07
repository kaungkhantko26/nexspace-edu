import { Sidebar } from "@/components/dashboard/sidebar";
import { ContentChecker } from "@/components/tools/content-checker";

export default function AiDetectorPage() {
  return (
    <div>
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>
      <ContentChecker kind="ai" />
    </div>
  );
}
