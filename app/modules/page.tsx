import { Sidebar } from "@/components/dashboard/sidebar";
import { NotesHub } from "@/components/modules/notes-hub";

export default function ModulesPage() {
  return (
    <div>
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>
      <NotesHub />
    </div>
  );
}
