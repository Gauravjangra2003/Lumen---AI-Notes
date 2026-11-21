import { NotesMobileHeader, NotesSidebarPanel, SidebarExpandButton } from "@/features/notes";

export default function NotesLayout({ children }: LayoutProps<"/notes">) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <NotesSidebarPanel />
      <SidebarExpandButton />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <NotesMobileHeader />
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 md:px-12 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
