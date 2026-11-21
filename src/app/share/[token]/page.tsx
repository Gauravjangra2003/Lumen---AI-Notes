import { Suspense } from "react";
import type { Metadata } from "next";

import { getSharedNote, SharedNoteSkeleton, SharedNoteView } from "@/features/notes/server";

const robots: Metadata["robots"] = { index: false, follow: false };

export async function generateMetadata({ params }: PageProps<"/share/[token]">): Promise<Metadata> {
  const { token } = await params;
  const result = await getSharedNote(token);
  return {
    title: result.status === "ok" ? result.note.title || "Untitled" : "Shared note",
    robots,
  };
}

export default function SharedNotePage({ params }: PageProps<"/share/[token]">) {
  return (
    <Suspense fallback={<SharedNoteSkeleton />}>
      <SharedNote params={params} />
    </Suspense>
  );
}

async function SharedNote({ params }: Pick<PageProps<"/share/[token]">, "params">) {
  const { token } = await params;
  const result = await getSharedNote(token);
  return <SharedNoteView result={result} token={token} />;
}
