import { Sidebar } from "@/components/dashboard/sidebar";
import { NoteEditor } from "@/components/modules/note-editor";

export default async function NotePage({ params }: { params: Promise<{ moduleId: string; noteId: string }> }) {
  const { moduleId, noteId } = await params;

  return (
    <div>
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>
      <NoteEditor moduleId={moduleId} noteId={noteId} />
    </div>
  );
}
