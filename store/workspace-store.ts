import { create } from "zustand";

export type AiMode =
  | "Student"
  | "Research"
  | "Coding"
  | "IELTS"
  | "Cybersecurity"
  | "Assignment Helper";

type WorkspaceState = {
  mode: AiMode;
  sidebarOpen: boolean;
  setMode: (mode: AiMode) => void;
  toggleSidebar: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mode: "Student",
  sidebarOpen: true,
  setMode: (mode) => set({ mode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));

