import type { Metadata } from "next";

import { NotesEmptyState } from "@/features/notes";

export const metadata: Metadata = {
  title: "Notes",
};

export default function NotesPage() {
  return <NotesEmptyState />;
}
