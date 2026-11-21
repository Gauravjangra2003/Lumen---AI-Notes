import { NotesSidebar } from "@/features/notes";

export default function NotesLayout({ children }: LayoutProps<"/notes">) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <NotesSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 md:px-12">{children}</div>
      </main>
    </div>
  );
}
