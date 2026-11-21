"use client";

import { useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { downloadPdf } from "../hooks/use-download-pdf";

export function SharedNoteDownloadButton({
  title,
  content,
}: {
  title: string;
  content: JSONContent | null;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await downloadPdf({ title, content });
    setPending(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <FileDown />}
      Download PDF
    </Button>
  );
}
